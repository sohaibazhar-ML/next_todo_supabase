import { POST } from './route'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { cleanupMocks } from '@/test/utils/handler-utils'
import { createSupabaseMock, setupSupabaseMock } from '@/test/utils/supabase-mock'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}))
jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}))

describe('Signout API', () => {
    let mockSupabase: any

    beforeEach(() => {
        jest.clearAllMocks()
        mockSupabase = createSupabaseMock()
        setupSupabaseMock(mockSupabase)
        
        ;(cookies as jest.Mock).mockReturnValue({
            get: jest.fn()
        })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should call signOut and redirect to default locale login', async () => {
        const mockCookies = cookies()
        ;(mockCookies.get as jest.Mock).mockReturnValue(undefined)

        await POST()

        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
        expect(redirect).toHaveBeenCalledWith('/de/login')
    })

    it('should call signOut and redirect to specific locale login from cookie', async () => {
        const mockCookies = cookies()
        ;(mockCookies.get as jest.Mock).mockReturnValue({ value: 'en' })

        await POST()

        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
        expect(redirect).toHaveBeenCalledWith('/en/login')
    })
})
