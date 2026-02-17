import { POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { cleanupMocks } from '@/test/utils/handler-utils'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}))
jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}))

describe('Signout API', () => {
    const mockSignOut = jest.fn()
    const mockGetCookie = jest.fn()

    beforeEach(() => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { signOut: mockSignOut }
        })
            ; (cookies as jest.Mock).mockResolvedValue({
                get: mockGetCookie
            })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should call signOut and redirect to default locale login', async () => {
        mockGetCookie.mockReturnValue(undefined)

        await POST()

        expect(mockSignOut).toHaveBeenCalled()
        expect(redirect).toHaveBeenCalledWith('/de/login')
    })

    it('should call signOut and redirect to specific locale login from cookie', async () => {
        mockGetCookie.mockReturnValue({ value: 'en' })

        await POST()

        expect(mockSignOut).toHaveBeenCalled()
        expect(redirect).toHaveBeenCalledWith('/en/login')
    })
})
