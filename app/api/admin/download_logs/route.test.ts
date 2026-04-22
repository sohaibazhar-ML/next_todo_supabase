import { GET, POST, DELETE } from './route'
import { prismaMock } from '../../../_lib/__mocks__/prisma'
import { isAdmin } from '../../../_utils/admin/roles'
import { createMockRequest, validateResponse, cleanupMocks } from '../../../../test/utils/handler-utils'
import { createSupabaseMock, setupSupabaseMock } from '../../../../test/utils/supabase-mock'

// Mock dependencies
jest.mock('../../../_lib/supabase/server')
jest.mock('../../../_utils/admin/roles')

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
            expect(prismaMock.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ user_id: mockUser.id })
            }))
        })

        it('should apply search filter (q)', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.download_logs.findMany.mockResolvedValue([])

            const response = await GET(createMockRequest('http://local/api/admin/download_logs?q=Chrome'))
            await validateResponse(response)

            expect(prismaMock.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        expect.objectContaining({ user_agent: { contains: 'Chrome', mode: 'insensitive' } }),
                        expect.objectContaining({ documents: { title: { contains: 'Chrome', mode: 'insensitive' } } })
                    ])
                })
            }))
        })
    })

    describe('POST & DELETE', () => {
        it('should create a download log manually', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            // body.user_id must match mockUser.id to avoid 403
            const body = { document_id: 'doc-1', user_id: mockUser.id }
            prismaMock.download_logs.create.mockResolvedValue({ id: 'new-log', ...body } as any)

            const request = createMockRequest('http://local/api/admin/download_logs', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'x-forwarded-for': '9.9.9.9', 'user-agent': 'Jest' }
            })
            const response = await POST(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(201)
            expect(data.id).toBe('new-log')
            expect(prismaMock.download_logs.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    ip_address: '9.9.9.9',
                    user_agent: 'Jest',
                    user_id: mockUser.id
                })
            }))
        })

        it('should delete a download log', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.download_logs.delete.mockResolvedValue({ id: 'log-1' } as any)

            const request = createMockRequest('http://local/api/admin/download_logs?id=log-1', {
                method: 'DELETE'
            })
            const response = await DELETE(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.id).toBe('log-1')
        })
    })
})
