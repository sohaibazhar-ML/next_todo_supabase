import { GET } from './route'
import { prismaMock } from '@/lib/__mocks__/prisma'
import { isAdmin } from '@/utils/roles'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'
import { createSupabaseMock, setupSupabaseMock } from '@/test/utils/supabase-mock'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/utils/roles')

describe('Download Logs API', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockLogs = [{ id: 'log-1', user_id: 'user-456' }]

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    describe('GET', () => {
        it('should return all logs for admin', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.download_logs.findMany.mockResolvedValue(mockLogs as any)

            const response = await GET(createMockRequest('http://local/api/admin/download_logs'))
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.data).toEqual(mockLogs)
            expect(data.total).toBe(mockLogs.length)
            // Admin should not have user_id forced in where clause
            expect(prismaMock.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {}
            }))
        })

        it('should return only own logs for regular user', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(false)
            prismaMock.download_logs.findMany.mockResolvedValue(mockLogs as any)

            const response = await GET(createMockRequest('http://local/api/admin/download_logs'))
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.data).toEqual(mockLogs)
            expect(data.total).toBe(mockLogs.length)
            // User should have user_id forced in where clause
            expect(prismaMock.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ user_id: mockUser.id })
            }))
        })
    })
})
