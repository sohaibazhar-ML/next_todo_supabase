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

describe('Documents Filter Options API', () => {
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

    it('should return 401 if not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
        const response = await GET(createMockRequest('http://localhost:3000/api/documents/filter-options'))

        const { status, error } = await validateResponse(response)
        expect(status).toBe(401)
        expect(error).toBe('Unauthorized')
    })

    it('should return filter options successfully', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

            // Mock the Promise.all calls to $queryRaw
            // 1. Categories
            // 2. File Types
            // 3. Tags
            ; (prisma.$queryRaw as jest.Mock)
                .mockResolvedValueOnce([{ category: 'Financial' }, { category: 'Legal' }])
                .mockResolvedValueOnce([{ file_type: 'pdf' }, { file_type: 'docx' }])
                .mockResolvedValueOnce([{ tag: 'important' }, { tag: 'urgent' }])

        const response = await GET(createMockRequest('http://localhost:3000/api/documents/filter-options'))
        const { status, data } = await validateResponse(response)

        expect(status).toBe(200)
        expect(data).toEqual({
            categories: ['Financial', 'Legal'],
            fileTypes: ['pdf', 'docx'],
            tags: ['important', 'urgent']
        })
    })

    it('should handle database errors', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('DB Failed'))

        const response = await GET(createMockRequest('http://localhost:3000/api/documents/filter-options'))
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toBe('DB Failed')
    })
})
