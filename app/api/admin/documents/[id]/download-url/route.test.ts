import { GET } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createMockRequest, validateResponse } from '@/test/utils/handler-utils'
import { isAdmin, isSubadmin } from '@/utils/roles'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

jest.mock('@/utils/roles')

jest.mock('@/lib/prisma', () => ({
    prisma: {
        documents: {
            findUnique: jest.fn()
        },
        download_logs: {
            create: jest.fn()
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
        
        // Default to admin for successful tests
        ;(isAdmin as jest.Mock).mockResolvedValue(true)
        ;(isSubadmin as jest.Mock).mockResolvedValue(false)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return 401 if not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        expect(response.status).toBe(401)
    })

    it('should return 403 if user is not admin or subadmin', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        ;(isAdmin as jest.Mock).mockResolvedValue(false)
        ;(isSubadmin as jest.Mock).mockResolvedValue(false)

        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        expect(response.status).toBe(403)
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

    it('should return signed URL successfully and create audit log', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue({ id: docId, file_path: 'path/to/doc.pdf' })

        mockSupabase.storage.createSignedUrl.mockResolvedValue({
            data: { signedUrl: 'https://download-link' },
            error: null
        })

        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        const { status, data } = await validateResponse(response)

        expect(status).toBe(200)
        expect(data).toEqual({ signedUrl: 'https://download-link' })
        expect(prisma.download_logs.create).toHaveBeenCalled()
    })

    it('should handle storage errors', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue({ id: docId, file_path: 'path/to/doc.pdf' })

        mockSupabase.storage.createSignedUrl.mockResolvedValue({
            data: null,
            error: { message: 'Storage Error' }
        })

        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toContain('Storage Error')
    })

    it('should return 500 if database query fails', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.documents.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'))

        const response = await GET(createMockRequest('http://local'), { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toBe('DB Error')
    })
})
