import { POST } from './route'
import { prismaMock } from '@/lib/__mocks__/prisma'
import { isAdmin } from '@/utils/roles'
import { ERROR_MESSAGES } from '@/constants'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'
import { createSupabaseMock, setupSupabaseMock } from '@/test/utils/supabase-mock'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/utils/roles')

describe('Document Upload API — POST /api/admin/documents/upload', () => {
    const mockUserId = 'user-123'
    const mockUser = { id: mockUserId, email: 'admin@example.com' }

    const makeFile = (name: string, type: string, size: number) => ({
        name,
        type,
        size,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(size))
    })

    const setupAuth = (isAdminValue = true) => {
        setupSupabaseMock(createSupabaseMock({ user: mockUser }))
        ;(isAdmin as jest.Mock).mockResolvedValue(isAdminValue)
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should return 401 if unauthorized', async () => {
        setupSupabaseMock(createSupabaseMock({ user: null }))
        const response = await POST(createMockRequest('http://local', { method: 'POST' }))
        expect(response.status).toBe(401)
    })

    it('should return 403 if user is not admin', async () => {
        setupAuth(false)
        const response = await POST(createMockRequest('http://local', { method: 'POST' }))
        expect(response.status).toBe(403)
        expect(await response.json()).toEqual({ error: ERROR_MESSAGES.PERMISSION_REQUIRED_UPLOAD_DOCUMENTS })
    })

    it('should return 400 if no files or category provided', async () => {
        setupAuth(true)
        const formData = {
            getAll: jest.fn().mockReturnValue([]),
            get: jest.fn().mockReturnValue(null)
        }
        const request = createMockRequest('http://local', { method: 'POST' })
        request.formData = jest.fn().mockResolvedValue(formData)

        const response = await POST(request)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toBe(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS)
    })

    it('should upload a single file successfully', async () => {
        setupAuth(true)
        const mockFile = makeFile('report.pdf', 'application/pdf', 1024)
        const formData = {
            getAll: jest.fn().mockReturnValue([mockFile]),
            get: jest.fn().mockImplementation((key) => {
                if (key === 'title') return 'Monthly Report'
                if (key === 'category') return 'business'
                if (key === 'tags') return JSON.stringify(['report', '2024'])
                return null
            })
        }
        
        const supabaseMock = createSupabaseMock({ user: mockUser })
        setupSupabaseMock(supabaseMock)
        
        const request = createMockRequest('http://local', { method: 'POST' })
        request.formData = jest.fn().mockResolvedValue(formData)

        prismaMock.documents.create.mockResolvedValue({
            id: 'doc-abc',
            title: 'Monthly Report',
            file_size: BigInt(1024),
            file_type: 'pdf'
        } as any)

        const response = await POST(request)
        const { status, data } = await validateResponse<any>(response)

        expect(status).toBe(201)
        expect(data.id).toBe('doc-abc')
        expect(supabaseMock.storage.from).toHaveBeenCalledWith('documents')
        expect(supabaseMock.storage.upload).toHaveBeenCalledWith(
            expect.stringContaining(`${mockUserId}/`),
            mockFile,
            expect.any(Object)
        )
        expect(prismaMock.documents.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                title: 'Monthly Report',
                category: 'business',
                tags: ['report', '2024']
            })
        }))
    })

    it('should handle multiple file uploads', async () => {
        setupAuth(true)
        const files = [
            makeFile('a.pdf', 'application/pdf', 100),
            makeFile('b.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 200)
        ]
        const formData = {
            getAll: jest.fn().mockReturnValue(files),
            get: jest.fn().mockImplementation((key) => (key === 'category' ? 'misc' : null))
        }

        const supabaseMock = createSupabaseMock({ user: mockUser })
        setupSupabaseMock(supabaseMock)
        
        const request = createMockRequest('http://local', { method: 'POST' })
        request.formData = jest.fn().mockResolvedValue(formData)

        prismaMock.documents.create.mockResolvedValue({ id: 'any', file_size: BigInt(0) } as any)

        const response = await POST(request)
        const { status, data } = await validateResponse<any[]>(response)

        expect(status).toBe(201)
        expect(data).toHaveLength(2)
        expect(supabaseMock.storage.upload).toHaveBeenCalledTimes(2)
        expect(prismaMock.documents.create).toHaveBeenCalledTimes(2)
    })

    it('should continue if one upload fails', async () => {
        setupAuth(true)
        const files = [makeFile('fail.pdf', 'pdf', 10), makeFile('success.pdf', 'pdf', 20)]
        const formData = {
            getAll: jest.fn().mockReturnValue(files),
            get: jest.fn().mockImplementation((key) => (key === 'category' ? 'test' : null))
        }

        const supabaseMock = createSupabaseMock({ user: mockUser })
        supabaseMock.storage.upload
            .mockResolvedValueOnce({ error: { message: 'Upload failed' } })
            .mockResolvedValueOnce({ data: { path: 'ok' }, error: null })
        setupSupabaseMock(supabaseMock)
        
        const request = createMockRequest('http://local', { method: 'POST' })
        request.formData = jest.fn().mockResolvedValue(formData)

        prismaMock.documents.create.mockResolvedValue({ id: 'ok', file_size: BigInt(20) } as any)

        const response = await POST(request)
        const { status, data } = await validateResponse<any>(response)

        expect(status).toBe(201)
        // Should only have created the successful one
        expect(prismaMock.documents.create).toHaveBeenCalledTimes(1)
    })
})
