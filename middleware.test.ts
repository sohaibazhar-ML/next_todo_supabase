import { middleware } from './middleware'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Mock dependencies
jest.mock('@supabase/ssr', () => ({
    createServerClient: jest.fn(),
}))

jest.mock('@/constants/console', () => ({
    CONSOLE_MESSAGES: {
        ERROR_MODIFYING_SESSION_COOKIES: 'Error modifying session cookies'
    }
}))

jest.mock('./i18n/routing', () => ({
    routing: {
        locales: ['de', 'en', 'fr', 'it'],
        defaultLocale: 'de'
    }
}))

jest.mock('next-intl/middleware', () => {
    return jest.fn(() => (req: NextRequest) => {
        const res = NextResponse.next()
        res.headers.set('x-next-intl-middleware', 'true')
        // Add a dummy cookie that can be copied/modified
        res.cookies.set('sb-access-token', 'initial-token', { maxAge: 3600 })
        return res
    })
})

describe('Middleware', () => {
    const mockOrigin = 'http://localhost:3000'

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.com'
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    })

    const createRequest = (path: string, options: any = {}) => {
        return new NextRequest(new URL(path, mockOrigin), options)
    }

    it('should skip middleware for API routes', async () => {
        const req = createRequest('/api/any')
        const res = await middleware(req)
        expect(res.headers.get('x-next-intl-middleware')).toBeNull()
    })

    it('should skip middleware for auth routes', async () => {
        const req = createRequest('/auth/callback')
        const res = await middleware(req)
        expect(res.headers.get('x-next-intl-middleware')).toBeNull()
    })

    it('should skip middleware for static files', async () => {
        const req = createRequest('/logo.png')
        const res = await middleware(req)
        expect(res.headers.get('x-next-intl-middleware')).toBeNull()
    })

    it('should redirect unauthenticated users on protected routes', async () => {
        const req = createRequest('/en/dashboard')
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('Unauthorized') })
            }
        }
            ; (createServerClient as jest.Mock).mockReturnValue(mockSupabase)

        const res = await middleware(req) as NextResponse
        expect(res.status).toBe(307)
        expect(res.headers.get('Location')).toBe(`${mockOrigin}/en/login`)
    })

    it('should allow authenticated users on protected routes', async () => {
        const req = createRequest('/en/dashboard')
        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
            }
        }
            ; (createServerClient as jest.Mock).mockReturnValue(mockSupabase)

        const res = await middleware(req) as NextResponse
        // Should return the intl response which we mocked to have this header
        expect(res.headers.get('x-next-intl-middleware')).toBe('true')
    })

    it('should run session-only cookie path without error when keepMeLoggedIn is false', async () => {
        const req = createRequest('/en/dashboard')
        req.cookies.set('keep_me_logged_in', 'false')

        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
            }
        }
            ; (createServerClient as jest.Mock).mockReturnValue(mockSupabase)

        // Should not throw and should return a response (not a redirect to login)
        const res = await middleware(req) as NextResponse
        expect(res.status).not.toBe(307)
        // The cookie should be present in the response
        const setCookieHeader = res.headers.get('set-cookie')
        expect(setCookieHeader).toContain('sb-access-token=initial-token')
    })
})
