import { GET } from './route'
import { prismaMock } from '../../../../_lib/__mocks__/prisma'
import { createMockRequest, validateResponse } from '../../../../../test/utils/handler-utils'
import { createSupabaseMock, setupSupabaseMock } from '../../../../../test/utils/supabase-mock'
import { ERROR_MESSAGES } from '../../../../_constants/admin'

// Mock dependencies
jest.mock('../../../../_lib/supabase/server')

describe('Documents Filter Options API', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    let mockSupabase: any

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
        mockSupabase = createSupabaseMock({ user: mockUser })
        setupSupabaseMock(mockSupabase)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return 401 if not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
        const response = await GET(createMockRequest('http://localhost:3000/api/admin/documents/filter-options'))

        const { status, error } = await validateResponse(response)
        expect(status).toBe(401)
        expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
    })

    it('should return filter options successfully', async () => {
        // Mock the Promise.all calls to $queryRaw
        prismaMock.$queryRaw
            .mockResolvedValueOnce([{ category: 'Financial' }, { category: 'Legal' }])
            .mockResolvedValueOnce([{ file_type: 'pdf' }, { file_type: 'docx' }])

        const response = await GET(createMockRequest('http://localhost:3000/api/admin/documents/filter-options'))
        const { status, data } = await validateResponse<any>(response)

        expect(status).toBe(200)
        expect(data).toEqual({
            categories: ['Financial', 'Legal'],
            fileTypes: ['pdf', 'docx'],
        })
    })

    it('should handle database errors', async () => {
        prismaMock.$queryRaw.mockRejectedValue(new Error('DB Failed'))

        const response = await GET(createMockRequest('http://localhost:3000/api/admin/documents/filter-options'))
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toBe('DB Failed')
    })
})
