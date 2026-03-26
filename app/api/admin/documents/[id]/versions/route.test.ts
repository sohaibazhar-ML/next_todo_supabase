import { GET } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createMockRequest, validateResponse } from '@/test/utils/handler-utils'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        $queryRaw: jest.fn()
    }
}))

describe('Document Versions API', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockSupabase = {
        auth: {
            getUser: jest.fn()
        }
    }
    const docId = '12345678-1234-1234-1234-123456789012'
    const params = { params: Promise.resolve({ id: docId }) }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return 401 if not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
        const response = await GET(createMockRequest('http://local'), params)
        expect(response.status).toBe(401)
    })

    it('should return 404 if document not found', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.$queryRaw as jest.Mock).mockResolvedValue([]) // First query (root) returns empty

        const response = await GET(createMockRequest('http://local'), params)
        const { status } = await validateResponse(response)
        expect(status).toBe(404)
    })

    it('should return versions successfully', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

            // Mock queryRaw responses
            ; (prisma.$queryRaw as jest.Mock)
                // 1. Root ID search
                .mockResolvedValueOnce([{ root_id: docId }])
                // 2. Versions fetch
                .mockResolvedValueOnce([
                    {
                        id: docId,
                        file_size: BigInt(500),
                        created_at: new Date('2024-01-01'),
                        updated_at: null,
                        tags: ['tag1']
                    },
                    {
                        id: 'doc-2',
                        file_size: 100, // Number type
                        created_at: '2024-01-02',
                        updated_at: '2024-01-03',
                        tags: null
                    }
                ])

        const response = await GET(createMockRequest('http://local'), params)
        const { status, data } = await validateResponse(response)

        expect(status).toBe(200)
        expect(data).toHaveLength(2)

        // Verify serialization
        expect((data as any)[0].id).toBe(docId)
        expect((data as any)[0].file_size).toBe(500) // Converted to number
        expect((data as any)[0].created_at).toBe('2024-01-01T00:00:00.000Z')

        expect((data as any)[1].file_size).toBe(100)
        expect((data as any)[1].updated_at).toBe('2024-01-03')
        expect((data as any)[1].tags).toEqual([]) // Null tags becomes empty array
    })

    it('should return 404 if versions query returns empty', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.$queryRaw as jest.Mock)
                .mockResolvedValueOnce([{ root_id: docId }])
                .mockResolvedValueOnce([])

        const response = await GET(createMockRequest('http://local'), params)
        expect(response.status).toBe(404)
    })

    it('should handle supabase client creation failure', async () => {
        (createClient as jest.Mock).mockRejectedValue(new Error('Init Error'))

        const response = await GET(createMockRequest('http://local'), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toBe('Init Error')
    })

    it('should handle root query database error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Root Query Error'))

        const response = await GET(createMockRequest('http://local'), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toBe('Root Query Error')
    })

    it('should handle versions query database error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.$queryRaw as jest.Mock)
                .mockResolvedValueOnce([{ root_id: docId }])
                .mockRejectedValue(new Error('Versions Query Error'))

        const response = await GET(createMockRequest('http://local'), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toBe('Versions Query Error')
    })

    it('should use fallbacks for unusual data types', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.$queryRaw as jest.Mock)
                .mockResolvedValueOnce([{ root_id: docId }])
                .mockResolvedValueOnce([{
                    id: docId,
                    file_size: null,
                    created_at: { not: 'a date' }, // Triggers line 86 fallback
                    updated_at: 123, // Triggers line 92 null fallback
                    tags: { not: 'an array' } // Triggers line 93 [] fallback
                },
                {
                    id: 'doc-3',
                    file_size: 200,
                    created_at: '2024-01-04',
                    updated_at: new Date('2024-01-05'), // Triggers line 90 branch
                    tags: ['test']
                }])

        const response = await GET(createMockRequest('http://local'), params)
        const { status, data } = await validateResponse(response)

        expect(status).toBe(200)
        expect((data as any)[0].created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/) // ISO string
        expect((data as any)[0].updated_at).toBeNull()
        expect((data as any)[0].tags).toEqual([])

        expect((data as any)[1].updated_at).toBe('2024-01-05T00:00:00.000Z')
    })
})
