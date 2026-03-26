import { NextRequest, NextResponse } from 'next/server'

// 1. Define the mock function BEFORE anything else
// We use a global variable to store the mock so the factory can access it
// even though it's hoisted.
let mockIntlMiddleware = jest.fn((req: any) => {
    const { NextResponse } = require('next/server')
    const res = NextResponse.next()
    res.headers.set('x-next-intl-middleware', 'true')
    res.cookies.set('sb-access-token', 'initial-token', { maxAge: 3600 })
    return res
})

// 2. Mock the module using the global mock
jest.mock('next-intl/middleware', () => {
    return jest.fn(() => (req: any) => mockIntlMiddleware(req))
})

// 3. Import the middleware AFTER the mock is set
import { middleware } from './middleware'
import { createServerClient } from '@supabase/ssr'

jest.mock('@supabase/ssr', () => ({
    createServerClient: jest.fn(),
}))

jest.mock('@/constants', () => ({
    CONSOLE_MESSAGES: {
        ERROR_MODIFYING_SESSION_COOKIES: 'Error modifying session cookies'
    }
}))

jest.mock('@/i18n/routing', () => ({
    routing: {
        locales: ['de', 'en', 'fr', 'it'],
        defaultLocale: 'de'
    }
}))

describe('Middleware', () => {
    const mockOrigin = 'http://localhost:3000'

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.com'
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
        
        // Reset the default implementation
        mockIntlMiddleware.mockImplementation((req: any) => {
            const { NextResponse } = require('next/server')
            const res = NextResponse.next()
            res.headers.set('x-next-intl-middleware', 'true')
            res.cookies.set('sb-access-token', 'initial-token', { maxAge: 3600 })
            return res
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    const createRequest = (path: string, options: any = {}) => {
        return new NextRequest(new URL(path, mockOrigin), options)
    }

    it('should skip middleware for API routes', async () => {
        const req = createRequest('/api/any')
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
        expect(res.headers.get('Location')).toBe(`${mockOrigin}/en/admin`)
    })

    it('should return intl redirect immediately', async () => {
        mockIntlMiddleware.mockReturnValueOnce(NextResponse.redirect(new URL('/de', mockOrigin)))

        const req = createRequest('/')
        const res = await middleware(req) as NextResponse
        expect(res.status).toBe(307)
        expect(res.headers.get('Location')).toBe(`${mockOrigin}/de`)
    })

    it('should handle session-only cookie modification', async () => {
        const req = createRequest('/en/dashboard')
        req.cookies.set('keep_me_logged_in', 'false')

        const mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
            }
        }
        ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)

        const res = await middleware(req) as NextResponse
        expect(res.status).not.toBe(307)
        expect(res.headers.get('set-cookie')).toContain('sb-access-token=initial-token')
    })
})
