import { GET } from './route'
import { prisma } from '@/lib/prisma'
import { DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'

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
        const request = createMockRequest('http://localhost/api/auth/resolve-username')
        const response = await GET(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(400)
        expect(error).toBe('Username is required')
    })

    it('should return 404 if profile is not found', async () => {
        prismaMock.profiles.findUnique.mockResolvedValue(null)

        const request = createMockRequest('http://localhost/api/auth/resolve-username?username=nonexistent')
        const response = await GET(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(404)
        expect(error).toBe('Profile not found')
        expect(prismaMock.profiles.findUnique).toHaveBeenCalledWith({
            where: { username: 'nonexistent' },
            select: { email: true }
        })
    })

    it('should return 200 with email if profile exists', async () => {
        prismaMock.profiles.findUnique.mockResolvedValue({
            email: 'test@example.com'
        } as any)

        const request = createMockRequest('http://localhost/api/auth/resolve-username?username=testuser')
        const response = await GET(request)
        const { status, data } = await validateResponse<any>(response)

        expect(status).toBe(200)
        expect(data.email).toBe('test@example.com')
    })

    it('should return 500 if an error occurs during resolution', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { })
        prismaMock.profiles.findUnique.mockRejectedValue(new Error('Database collision'))

        const request = createMockRequest('http://localhost/api/auth/resolve-username?username=testuser')
        const response = await GET(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(500)
        expect(error).toBe('Internal server error')
        expect(console.error).toHaveBeenCalled()
    })
})
