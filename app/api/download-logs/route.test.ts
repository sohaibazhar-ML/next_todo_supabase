import { GET, POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createMockRequest, validateResponse } from '@/test/utils/handler-utils'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        profiles: {
            findUnique: jest.fn()
        },
        download_logs: {
            findMany: jest.fn(),
            create: jest.fn()
        }
    }
}))

describe('Download Logs API', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockSupabase = {
        auth: {
            getUser: jest.fn()
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('GET', () => {
        it('should return 401 if not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
            const response = await GET(createMockRequest('http://localhost:3000/api/download-logs'))
            const { status, error } = await validateResponse(response)
            expect(status).toBe(401)
            expect(error).toBe('Unauthorized')
        })

        it('should return all logs for admin', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' })
            const mockLogs = [{ id: 'log-1', user_id: 'user-456' }]
                ; (prisma.download_logs.findMany as jest.Mock).mockResolvedValue(mockLogs)

            const response = await GET(createMockRequest('http://localhost:3000/api/download-logs'))
            const { status, data } = await validateResponse(response)

            expect(status).toBe(200)
            expect(data).toEqual(mockLogs)
            // Admin should not have user_id forced in where clause
            expect(prisma.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {}
            }))
        })

        it('should return only own logs for regular user', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'user' })
            const mockLogs = [{ id: 'log-1', user_id: mockUser.id }]
                ; (prisma.download_logs.findMany as jest.Mock).mockResolvedValue(mockLogs)

            const response = await GET(createMockRequest('http://localhost:3000/api/download-logs'))
            const { status, data } = await validateResponse(response)

            expect(status).toBe(200)
            expect(data).toEqual(mockLogs)
            // User should have user_id forced in where clause
            expect(prisma.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ user_id: mockUser.id })
            }))
        })

        it('should filter by userId for admin', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' })
                ; (prisma.download_logs.findMany as jest.Mock).mockResolvedValue([])

            const url = 'http://localhost:3000/api/download-logs?userId=other-user'
            await GET(createMockRequest(url))

            expect(prisma.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ user_id: 'other-user' })
            }))
        })

        it('should filter by both documentId and userId for admin', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' })
                ; (prisma.download_logs.findMany as jest.Mock).mockResolvedValue([])

            const url = 'http://localhost:3000/api/download-logs?documentId=doc-123&userId=user-456'
            await GET(createMockRequest(url))

            expect(prisma.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    document_id: 'doc-123',
                    user_id: 'user-456'
                }
            }))
        })

        it('should override userId filter for regular user', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'user' })
                ; (prisma.download_logs.findMany as jest.Mock).mockResolvedValue([])

            // User tries to see another user's logs
            const url = 'http://localhost:3000/api/download-logs?userId=malicious-user'
            await GET(createMockRequest(url))

            expect(prisma.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ user_id: mockUser.id })
            }))
        })

        it('should handle initialization failure', async () => {
            (createClient as jest.Mock).mockRejectedValue(new Error('Init Error'))
            const response = await GET(createMockRequest('http://local'))
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Init Error')
        })

        it('should handle database fetch errors', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' })
                ; (prisma.download_logs.findMany as jest.Mock).mockRejectedValue(new Error('Fetch Error'))

            const response = await GET(createMockRequest('http://localhost:3000/api/download-logs'))
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Fetch Error')
        })

        it('should handle non-standard database errors', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' })
                ; (prisma.download_logs.findMany as jest.Mock).mockRejectedValue('String Error')

            const response = await GET(createMockRequest('http://localhost:3000/api/download-logs'))
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Internal server error')
        })
    })

    describe('POST', () => {
        const validBody = {
            document_id: 'doc-123',
            user_id: mockUser.id,
            context: 'test',
            metadata: { foo: 'bar' }
        }

        it('should return 401 if not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
            const response = await POST(createMockRequest('http://localhost:3000/api/download-logs', {
                method: 'POST',
                body: JSON.stringify(validBody)
            }))
            expect(response.status).toBe(401)
        })

        it('should return 403 if trying to log for another user', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            const response = await POST(createMockRequest('http://localhost:3000/api/download-logs', {
                method: 'POST',
                body: JSON.stringify({ ...validBody, user_id: 'other-user' })
            }))
            const { status, error } = await validateResponse(response)
            expect(status).toBe(403)
            expect(error).toBe('Forbidden')
        })

        it('should create log successfully with all fields', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.download_logs.create as jest.Mock).mockResolvedValue({ id: 'log-1', ...validBody })

            const req = createMockRequest('http://localhost:3000/api/download-logs', {
                method: 'POST',
                body: JSON.stringify(validBody),
                headers: {
                    'x-forwarded-for': '127.0.0.1',
                    'user-agent': 'TestAgent'
                }
            })

            const response = await POST(req)
            const { status, data } = await validateResponse(response)

            expect(status).toBe(201)
            expect(data).toHaveProperty('id', 'log-1')
            expect(prisma.download_logs.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    document_id: 'doc-123',
                    user_id: mockUser.id,
                    ip_address: '127.0.0.1',
                    user_agent: 'TestAgent',
                    context: 'test',
                    metadata: { foo: 'bar' }
                })
            }))
        })

        it('should create log successfully with missing optional fields and headers', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.download_logs.create as jest.Mock).mockResolvedValue({ id: 'log-2' })

            const minimalBody = {
                document_id: 'doc-123',
                user_id: mockUser.id
            }

            const req = createMockRequest('http://localhost:3000/api/download-logs', {
                method: 'POST',
                body: JSON.stringify(minimalBody)
            })

            const response = await POST(req)
            expect(response.status).toBe(201)
            expect(prisma.download_logs.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    ip_address: null,
                    user_agent: null,
                    context: null,
                    metadata: null
                })
            }))
        })

        it('should extract first IP from multiple IPs in x-forwarded-for', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.download_logs.create as jest.Mock).mockResolvedValue({ id: 'log-3' })

            const req = createMockRequest('http://localhost:3000/api/download-logs', {
                method: 'POST',
                body: JSON.stringify(validBody),
                headers: {
                    'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3'
                }
            })

            await POST(req)
            expect(prisma.download_logs.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    ip_address: '1.1.1.1'
                })
            }))
        })

        it('should handle initialization failure in POST', async () => {
            (createClient as jest.Mock).mockRejectedValue(new Error('Init Error'))
            const response = await POST(createMockRequest('http://local', { method: 'POST', body: JSON.stringify(validBody) }))
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Init Error')
        })

        it('should handle database errors in POST', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.download_logs.create as jest.Mock).mockRejectedValue(new Error('Create Error'))

            const response = await POST(createMockRequest('http://localhost:3000/api/download-logs', {
                method: 'POST',
                body: JSON.stringify(validBody)
            }))
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Create Error')
        })
    })
})
