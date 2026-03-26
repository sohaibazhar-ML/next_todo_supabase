import { GET, POST, PUT, DELETE } from './route'
import { prismaMock } from '@/lib/__mocks__/prisma'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'
import { createSupabaseMock, setupSupabaseMock } from '@/test/utils/supabase-mock'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/utils/roles')

describe('Generic Admin CRUD API — /api/admin/[resource]', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000'
    const mockUser = { id: mockUserId, email: 'admin@example.com' }
    
    // Helper to mock the authorize() function inside the handler
    // Since we can't easily mock the internal authorize(), we mock the dependencies it uses
    const setupAuth = (isAdmin = true, role = 'admin') => {
        setupSupabaseMock(createSupabaseMock({ user: mockUser }))
        prismaMock.profiles.findUnique.mockResolvedValue({ id: mockUserId, role } as any)
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // jest.spyOn(console, 'error').mockImplementation(() => { })
        jest.spyOn(console, 'warn').mockImplementation(() => { })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    describe('GET Handler', () => {
        const params = Promise.resolve({ resource: 'documents' })

        it('should return 401 if unauthorized', async () => {
            setupSupabaseMock(createSupabaseMock({ user: null }))
            const response = await GET(createMockRequest('http://local'), { params })
            expect(response.status).toBe(401)
        })

        it('should return 403 if user is not admin or subadmin', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            prismaMock.profiles.findUnique.mockResolvedValue({ role: 'user' } as any)
            const response = await GET(createMockRequest('http://local'), { params })
            expect(response.status).toBe(403)
        })

        it('should return stats for resource="stats"', async () => {
            setupAuth()
            const statsParams = Promise.resolve({ resource: 'stats' })
            prismaMock.profiles.count.mockResolvedValue(10)
            prismaMock.documents.count.mockResolvedValue(50)
            prismaMock.download_logs.count.mockResolvedValue(100)

            const response = await GET(createMockRequest('http://local'), { params: statsParams })
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.totalUsers).toBe(10)
            expect(data.totalDocuments).toBe(50)
            expect(data.totalDownloads).toBe(100)
        })

        it('should handle getOne with ?id=', async () => {
            setupAuth()
            const id = '550e8400-e29b-41d4-a716-446655440001'
            prismaMock.documents.findUnique.mockResolvedValue({ id, title: 'Test Doc', file_size: BigInt(1000) } as any)

            const response = await GET(createMockRequest(`http://local?id=${id}`), { params })
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.id).toBe(id)
            expect(data.file_size).toBe(1000) // Serialized
        })

        it('should return 404 for non-existent record', async () => {
            setupAuth()
            const id = '550e8400-e29b-41d4-a716-446655440001'
            prismaMock.documents.findUnique.mockResolvedValue(null)

            const response = await GET(createMockRequest(`http://local?id=${id}`), { params })
            expect(response.status).toBe(404)
        })

        it('should handle getMany with ?ids=[]', async () => {
            setupAuth()
            const id1 = '550e8400-e29b-41d4-a716-446655440001'
            const id2 = '550e8400-e29b-41d4-a716-446655440002'
            prismaMock.documents.findMany.mockResolvedValue([
                { id: id1, title: 'Doc 1' },
                { id: id2, title: 'Doc 2' }
            ] as any)

            const response = await GET(createMockRequest(`http://local?ids=${JSON.stringify([id1, id2])}`), { params })
            const { status, data } = await validateResponse<any[]>(response)

            expect(status).toBe(200)
            expect(data).toHaveLength(2)
        })

        it('should handle getList with pagination and filtering', async () => {
            setupAuth()
            prismaMock.documents.findMany.mockResolvedValue([{ id: 'd1', title: 'Doc 1' }] as any)
            prismaMock.documents.count.mockResolvedValue(1)

            const filters = JSON.stringify({ q: 'doc', category: 'work' })
            const response = await GET(createMockRequest(`http://local?_page=2&_perPage=5&_filters=${filters}`), { params })
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.data).toHaveLength(1)
            expect(data.total).toBe(1)
            expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 5,
                take: 5,
                where: expect.objectContaining({
                    OR: expect.any(Array)
                })
            }))
        })

        it('should handle db retry logic in fetchUserRole', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            prismaMock.profiles.findUnique
                .mockRejectedValueOnce(new Error('P1001'))
                .mockResolvedValueOnce({ id: mockUserId, role: 'admin' } as any)

            jest.useFakeTimers()
            prismaMock.documents.findMany.mockResolvedValue([])
            prismaMock.documents.count.mockResolvedValue(0)
            
            const promise = GET(createMockRequest('http://local'), { params })
            
            // Advance timers to trigger the retry
            await jest.advanceTimersByTimeAsync(1000)
            
            const response = await promise
            expect(response.status).toBe(200)
            expect(prismaMock.profiles.findUnique).toHaveBeenCalledTimes(2)
            jest.useRealTimers()
        })

        it('should return 503 if database remains unavailable after retry', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            prismaMock.profiles.findUnique
                .mockRejectedValue(new Error('P1001')) // Persistent failure

            jest.useFakeTimers()
            const promise = GET(createMockRequest('http://local'), { params })
            await jest.advanceTimersByTimeAsync(1000)
            
            const response = await promise
            const { status, error } = await validateResponse(response)
            
            expect(status).toBe(503)
            expect(error).toBe('Database temporarily unavailable')
            jest.useRealTimers()
        })
    })

    describe('POST/PUT/DELETE Handlers', () => {
        const params = Promise.resolve({ resource: 'documents' })
        const body = { title: 'New Doc', category: 'work' }

        it('should create record on POST', async () => {
            setupAuth(true) // admin
            prismaMock.documents.create.mockResolvedValue({ id: 'new', ...body } as any)

            const response = await POST(createMockRequest('http://local', { method: 'POST', body: JSON.stringify(body) }), { params })
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(201)
            expect(data.id).toBe('new')
        })

        it('should update record on PUT', async () => {
            setupAuth(true)
            const id = '550e8400-e29b-41d4-a716-446655440001'
            prismaMock.documents.update.mockResolvedValue({ id, ...body } as any)

            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ id, ...body }) }), { params })
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(prismaMock.documents.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id }
            }))
        })

        it('should delete record on DELETE', async () => {
            setupAuth(true)
            const id = '550e8400-e29b-41d4-a716-446655440001'

            const response = await DELETE(createMockRequest(`http://local?id=${id}`, { method: 'DELETE' }), { params })
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(prismaMock.documents.delete).toHaveBeenCalledWith({ where: { id } })
        })

        it('should return 403 for non-admin on POST', async () => {
            setupAuth(false, 'subadmin') // subadmins can't POST in this route's logic
            const response = await POST(createMockRequest('http://local', { method: 'POST', body: JSON.stringify(body) }), { params })
            expect(response.status).toBe(403)
        })
    })

    describe('Flattening logic for download_logs', () => {
        const params = Promise.resolve({ resource: 'download_logs' })

        it('should flatten document title and profile info', async () => {
            setupAuth()
            const record = {
                id: 'log1',
                documents: { title: 'Main Report' },
                profiles: { username: 'jdoe', email: 'jdoe@test.com' }
            }
            prismaMock.download_logs.findUnique.mockResolvedValue(record as any)

            const response = await GET(createMockRequest(`http://local?id=550e8400-e29b-41d4-a716-446655440001`), { params })
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.document_title).toBe('Main Report')
            expect(data.username).toBe('jdoe')
        })
    })
})
