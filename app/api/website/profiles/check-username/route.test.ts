import { GET } from './route'
import { prismaMock } from '../../../../_lib/__mocks__/prisma'
import { createMockRequest, validateResponse, cleanupMocks } from '../../../../../test/utils/handler-utils'
import { ERROR_MESSAGES } from '../../../../_constants/website'

describe('Check Username API', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should return 400 if username is missing', async () => {
        const response = await GET(createMockRequest('http://localhost:3000/api/website/profiles/check-username'))
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toBe(ERROR_MESSAGES.USERNAME_REQUIRED)
    })

    it('should return available: true if username is not taken', async () => {
        prismaMock.profiles.findUnique.mockResolvedValue(null)

        const response = await GET(createMockRequest('http://localhost:3000/api/website/profiles/check-username?username=newuser'))
        const { status, data } = await validateResponse(response)

        expect(status).toBe(200)
        expect(data).toEqual({ available: true })
        expect(prismaMock.profiles.findUnique).toHaveBeenCalledWith({
            where: { username: 'newuser' },
            select: { id: true }
        })
    })

    it('should return available: false if username is taken', async () => {
        prismaMock.profiles.findUnique.mockResolvedValue({ id: 'user-123' } as any)

        const response = await GET(createMockRequest('http://localhost:3000/api/website/profiles/check-username?username=existinguser'))
        const { status, data } = await validateResponse(response)

        expect(status).toBe(200)
        expect(data).toEqual({ available: false })
    })

    it('should handle database errors', async () => {
        prismaMock.profiles.findUnique.mockRejectedValue(new Error('DB Error'))

        const response = await GET(createMockRequest('http://localhost:3000/api/website/profiles/check-username?username=testuser'))
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toBe('DB Error')
    })
})
