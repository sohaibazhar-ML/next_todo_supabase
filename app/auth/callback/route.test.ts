import { GET } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { cleanupMocks } from '@/test/utils/handler-utils'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/prisma', () => ({
    prisma: (require('jest-mock-extended') as any).mockDeep(),
}))
jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Auth Callback API', () => {
    const mockOrigin = 'http://localhost'
    const mockUserId = 'user-123'
    const mockUser = { id: mockUserId, email: 'test@example.com' }

    const mockExchangeCodeForSession = jest.fn()
    const mockResend = jest.fn()
    const mockGetCookie = jest.fn()

    beforeEach(() => {
        jest.useFakeTimers()
        jest.spyOn(console, 'log').mockImplementation(() => { })
        jest.spyOn(console, 'error').mockImplementation(() => { })
        jest.spyOn(console, 'warn').mockImplementation(() => { })

            ; (createClient as jest.Mock).mockResolvedValue({
                auth: {
                    exchangeCodeForSession: mockExchangeCodeForSession,
                    resend: mockResend
                }
            })
            ; (cookies as jest.Mock).mockResolvedValue({
                get: mockGetCookie
            })

        mockGetCookie.mockReturnValue({ value: 'de' })
    })

    afterEach(() => {
        jest.useRealTimers()
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should redirect with specific locale from cookie', async () => {
        mockGetCookie.mockReturnValue({ value: 'en' })
        const request = new Request(`${mockOrigin}/auth/callback`)
        const response = await GET(request)

        expect(response.headers.get('Location')).toBe(`${mockOrigin}/en/dashboard`)
    })

    it('should use default locale if NEXT_LOCALE cookie is missing', async () => {
        mockGetCookie.mockReturnValue(undefined)
        const request = new Request(`${mockOrigin}/auth/callback`)
        const response = await GET(request)

        expect(response.headers.get('Location')).toBe(`${mockOrigin}/de/dashboard`)
    })

    it('should redirect back to login if session data is missing after exchange', async () => {
        mockExchangeCodeForSession.mockResolvedValue({ data: null, error: null })
        const request = new Request(`${mockOrigin}/auth/callback?code=some-code`)
        const response = await GET(request)

        expect(response.headers.get('Location')).toContain('/login?error=Authentication%20failed')
    })

    it('should redirect to dashboard if no code is provided', async () => {
        const request = new Request(`${mockOrigin}/auth/callback`)
        const response = await GET(request)

        expect(response.status).toBe(307)
        expect(response.headers.get('Location')).toBe(`${mockOrigin}/de/dashboard`)
    })

    it('should redirect to reset-password if type is recovery', async () => {
        const request = new Request(`${mockOrigin}/auth/callback?type=recovery`)
        const response = await GET(request)

        expect(response.status).toBe(307)
        expect(response.headers.get('Location')).toBe(`${mockOrigin}/de/reset-password`)
    })

    it('should skip profile logic and redirect to reset-password if both code and type=recovery are present', async () => {
        mockExchangeCodeForSession.mockResolvedValue({ data: { user: mockUser, session: {} }, error: null })
        const request = new Request(`${mockOrigin}/auth/callback?code=123&type=recovery`)
        const response = await GET(request)

        expect(response.headers.get('Location')).toBe(`${mockOrigin}/de/reset-password`)
        expect(prismaMock.profiles.findUnique).not.toHaveBeenCalled()
    })

    describe('Code Exchange & Retry Logic', () => {
        const code = 'valid-code'
        const request = new Request(`${mockOrigin}/auth/callback?code=${code}`)

        it('should redirect to login on immediate exchange failure', async () => {
            mockExchangeCodeForSession.mockResolvedValue({ data: null, error: { message: 'Invalid code' } })

            const response = await GET(request)

            expect(response.status).toBe(307)
            expect(response.headers.get('Location')).toContain('/login?error=Invalid%20code')
        })

        it('should retry on network errors and succeed eventually', async () => {
            mockExchangeCodeForSession
                .mockResolvedValueOnce({ data: null, error: { message: 'fetch failed' } })
                .mockResolvedValueOnce({ data: { user: mockUser, session: {} }, error: null })

            prismaMock.profiles.findUnique.mockResolvedValue({ email_confirmed: true, email_confirmed_at: new Date() } as any)

            const promise = GET(request)

            // Advance timers for the retry delay
            await jest.advanceTimersByTimeAsync(1500)

            const response = await promise

            expect(mockExchangeCodeForSession).toHaveBeenCalledTimes(2)
            expect(response.status).toBe(307)
            expect(response.headers.get('Location')).toBe(`${mockOrigin}/de/dashboard`)
        })

        it('should fail after 3 retries on persistent network errors', async () => {
            mockExchangeCodeForSession.mockResolvedValue({ data: null, error: { message: 'fetch failed' } })

            const promise = GET(request)

            await jest.advanceTimersByTimeAsync(1500)
            await jest.advanceTimersByTimeAsync(1500)
            await jest.advanceTimersByTimeAsync(1500)

            const response = await promise

            expect(mockExchangeCodeForSession).toHaveBeenCalledTimes(3)
            expect(response.status).toBe(307)
            expect(response.headers.get('Location')).toContain('/login?error=fetch%20failed')
        })
    })

    describe('Profile Flow Logic', () => {
        const code = 'valid-code'
        const request = new Request(`${mockOrigin}/auth/callback?code=${code}`)

        beforeEach(() => {
            mockExchangeCodeForSession.mockResolvedValue({ data: { user: mockUser, session: {} }, error: null })
        })

        it('should redirect to profile setup if no profile exists (OAuth signup)', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(null)

            const response = await GET(request)

            expect(response.status).toBe(307)
            expect(response.headers.get('Location')).toBe(`${mockOrigin}/de/profile?setup=true`)
        })

        it('should handle first confirmation for manual signup', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ email_confirmed: false } as any)
            mockResend.mockResolvedValue({ error: null })

            const response = await GET(request)

            expect(prismaMock.profiles.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: mockUserId },
                data: { email_confirmed: true }
            }))
            expect(mockResend).toHaveBeenCalledWith(expect.objectContaining({
                type: 'signup',
                email: mockUser.email
            }))
            expect(response.status).toBe(307)
            expect(response.headers.get('Location')).toContain('message=First%20confirmation%20successful')
        })

        it('should handle second confirmation (fully confirm)', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ email_confirmed: true, email_confirmed_at: null } as any)

            const response = await GET(request)

            expect(prismaMock.profiles.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: mockUserId },
                data: expect.objectContaining({
                    email_confirmed: true,
                    email_confirmed_at: expect.any(Date)
                })
            }))
            expect(response.status).toBe(307)
            expect(response.headers.get('Location')).toContain('message=Account%20fully%20confirmed!')
        })

        it('should handle email resend failure gracefully', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ email_confirmed: false } as any)
            mockResend.mockResolvedValue({ error: { message: 'Resend failed' } })

            const response = await GET(request)

            // Should still return 307 because it fallsthrough to the end after failing the !emailError check
            expect(response.status).toBe(307)
            expect(response.headers.get('Location')).toBe(`${mockOrigin}/de/dashboard`)
        })

        it('should just redirect to dashboard if already fully confirmed', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ email_confirmed: true, email_confirmed_at: new Date() } as any)

            const response = await GET(request)

            expect(prismaMock.profiles.update).not.toHaveBeenCalled()
            expect(response.status).toBe(307)
            expect(response.headers.get('Location')).toBe(`${mockOrigin}/de/dashboard`)
        })
    })
})
