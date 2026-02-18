import { GET } from './route'
import { prisma } from '@/lib/prisma'
import { createMockRequest, validateResponse } from '@/test/utils/handler-utils'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        profiles: {
            findUnique: jest.fn()
        }
    }
}))

describe('Check Username API', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
    })

    it('should return 400 if username is missing', async () => {
        const response = await GET(createMockRequest('http://localhost:3000/api/profiles/check-username'))
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toBe('Username is required')
    })

    it('should return available: true if username is not taken', async () => {
        ; (prisma.profiles.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await GET(createMockRequest('http://localhost:3000/api/profiles/check-username?username=newuser'))
        const { status, data } = await validateResponse(response)

        expect(status).toBe(200)
        expect(data).toEqual({ available: true })
        expect(prisma.profiles.findUnique).toHaveBeenCalledWith({
            where: { username: 'newuser' },
            select: { id: true }
        })
    })

    it('should return available: false if username is taken', async () => {
        ; (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ id: 'user-123' })

        const response = await GET(createMockRequest('http://localhost:3000/api/profiles/check-username?username=existinguser'))
        const { status, data } = await validateResponse(response)

        expect(status).toBe(200)
        expect(data).toEqual({ available: false })
    })

    it('should handle database errors', async () => {
        ; (prisma.profiles.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'))

        const response = await GET(createMockRequest('http://localhost:3000/api/profiles/check-username?username=testuser'))
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toBe('DB Error')
    })
})
