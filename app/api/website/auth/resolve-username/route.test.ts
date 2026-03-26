import { GET } from './route'
import { prisma } from '@/lib/prisma'
import { DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'
import { ERROR_MESSAGES } from '@/website/constants'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: (require('jest-mock-extended') as any).mockDeep(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Resolve Username API', () => {
    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should return 400 if username is missing', async () => {
        const request = createMockRequest('http://localhost/api/website/auth/resolve-username')
        const response = await GET(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(400)
        expect(error).toBe(ERROR_MESSAGES.USERNAME_REQUIRED)
    })

    it('should return 404 if profile is not found', async () => {
        prismaMock.profiles.findUnique.mockResolvedValue(null)

        const request = createMockRequest('http://localhost/api/website/auth/resolve-username?username=nonexistent')
        const response = await GET(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(404)
        expect(error).toBe(ERROR_MESSAGES.PROFILE_NOT_FOUND)
        expect(prismaMock.profiles.findUnique).toHaveBeenCalledWith({
            where: { username: 'nonexistent' },
            select: { email: true }
        })
    })

    it('should return 200 with email if profile exists', async () => {
        prismaMock.profiles.findUnique.mockResolvedValue({
            email: 'test@example.com'
        } as any)

        const request = createMockRequest('http://localhost/api/website/auth/resolve-username?username=testuser')
        const response = await GET(request)
        const { status, data } = await validateResponse<any>(response)

        expect(status).toBe(200)
        expect(data.email).toBe('test@example.com')
    })

    it('should return 500 if an error occurs during resolution', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { })
        prismaMock.profiles.findUnique.mockRejectedValue(new Error('Database collision'))

        const request = createMockRequest('http://localhost/api/website/auth/resolve-username?username=testuser')
        const response = await GET(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(500)
        expect(error).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
        expect(console.error).toHaveBeenCalled()
    })
})
