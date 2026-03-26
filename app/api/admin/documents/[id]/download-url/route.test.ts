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
        documents: {
            findUnique: jest.fn()
        }
    }
}))

describe('Document Download URL API', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockSupabase = {
        auth: {
            getUser: jest.fn()
        },
        storage: {
            from: jest.fn().mockReturnThis(),
            createSignedUrl: jest.fn()
        }
    }
    const docId = '12345678-1234-1234-1234-123456789012'

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
        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        expect(response.status).toBe(401)
    })

    it('should return 400 for invalid UUID', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: 'invalid-id' }) })
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('Invalid document ID format')
    })

    it('should return 404 if document not found', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        expect(response.status).toBe(404)
    })

    it('should return signed URL successfully', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue({ file_path: 'path/to/doc.pdf' })

        mockSupabase.storage.createSignedUrl.mockResolvedValue({
            data: { signedUrl: 'https://download-link' },
            error: null
        })

        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        const { status, data } = await validateResponse(response)

        expect(status).toBe(200)
        expect(data).toEqual({ signedUrl: 'https://download-link' })
    })

    it('should handle storage errors', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue({ file_path: 'path/to/doc.pdf' })

        mockSupabase.storage.createSignedUrl.mockResolvedValue({
            data: null,
            error: { message: 'Storage Error' }
        })

        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toContain('Storage Error')
    })

    it('should return 500 if signed URL is missing in data', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue({ file_path: 'path/to/doc.pdf' })

        mockSupabase.storage.createSignedUrl.mockResolvedValue({
            data: { signedUrl: null },
            error: null
        })

        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toContain('Failed to generate download URL: No URL returned')
    })

    it('should return 500 if database query fails', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.documents.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'))

        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toBe('DB Error')
    })

    it('should return 500 if supabase client creation fails', async () => {
        (createClient as jest.Mock).mockRejectedValue(new Error('Supabase Init Error'))

        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toBe('Supabase Init Error')
    })
})
