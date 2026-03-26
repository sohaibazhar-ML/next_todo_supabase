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
        documents: {
            findUnique: jest.fn()
        },
        user_document_versions: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn()
        }
    }
}))

describe('Document Edit API', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockSupabase = {
        auth: {
            getUser: jest.fn()
        }
    }
    const docId = 'doc-123'
    const params = { params: Promise.resolve({ id: docId }) }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('POST - Save Version', () => {
        it('should return 401 if not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
            const response = await POST(createMockRequest('http://local', { method: 'POST' }), params)
            expect(response.status).toBe(401)
        })

        it('should create new version successfully', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue({ id: docId, file_type: 'document' })
                ; (prisma.user_document_versions.findFirst as jest.Mock).mockResolvedValue({ version_number: 1 })

            const mockCreatedVersion = {
                id: 'version-2',
                version_number: 2,
                exported_file_size: BigInt(2048)
            }
                ; (prisma.user_document_versions.create as jest.Mock).mockResolvedValue(mockCreatedVersion)

            const body = {
                html_content: '<p>Edit</p>',
                version_name: 'v2'
            }

            const response = await POST(createMockRequest('http://local', {
                method: 'POST',
                body: JSON.stringify(body)
            }), params)

            const { status, data } = await validateResponse(response)

            expect(status).toBe(201)
            expect((data as any).version_number).toBe(2)
            expect((data as any).exported_file_size).toBe('2048') // BigInt serialization check
            expect(prisma.user_document_versions.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    version_number: 2,
                    html_content: '<p>Edit</p>'
                })
            }))
        })

        it('should return 404 if document not found', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue(null)

            const response = await POST(createMockRequest('http://local', {
                method: 'POST',
                body: JSON.stringify({})
            }), params)

            const { status, error } = await validateResponse(response)
            expect(status).toBe(404)
            expect(error).toContain('Document not found')
        })

        it('should create version 1 if no previous version exists', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue({ id: docId, file_type: 'document' })
                ; (prisma.user_document_versions.findFirst as jest.Mock).mockResolvedValue(null)

            const mockCreatedVersion = {
                id: 'version-1',
                version_number: 1,
                exported_file_size: null
            }
                ; (prisma.user_document_versions.create as jest.Mock).mockResolvedValue(mockCreatedVersion)

            const response = await POST(createMockRequest('http://local', {
                method: 'POST',
                body: JSON.stringify({})
            }), params)

            const { status, data } = await validateResponse(response)
            expect(status).toBe(201)
            expect((data as any).version_number).toBe(1)
        })

        it('should handle missing optional content in POST', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue({ id: docId, file_type: 'document' })
                ; (prisma.user_document_versions.findFirst as jest.Mock).mockResolvedValue(null)

            const mockCreatedVersion = {
                id: 'version-1',
                version_number: 1,
                exported_file_size: BigInt(0),
                html_content: null,
                pdf_text_content: null,
                pdf_annotations: null
            }
                ; (prisma.user_document_versions.create as jest.Mock).mockResolvedValue(mockCreatedVersion)

            const response = await POST(createMockRequest('http://local', {
                method: 'POST',
                body: JSON.stringify({ version_name: '' })
            }), params)

            const { status, data } = await validateResponse(response)
            expect(status).toBe(201)
            expect((data as any).exported_file_size).toBe('0')
            expect(prisma.user_document_versions.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    version_name: null,
                    html_content: null,
                    pdf_text_content: null,
                    pdf_annotations: null
                })
            }))
        })

        it('should handle database errors during POST', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.documents.findUnique as jest.Mock).mockRejectedValue(new Error('POST DB Error'))

            const response = await POST(createMockRequest('http://local', {
                method: 'POST',
                body: JSON.stringify({})
            }), params)

            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('POST DB Error')
        })
    })

    describe('GET - List Versions', () => {
        it('should return 401 if not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
            const response = await GET(createMockRequest('http://local'), params)
            expect(response.status).toBe(401)
        })

        it('should return serialized versions', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            const mockVersions = [
                { id: 'v1', exported_file_size: BigInt(100) },
                { id: 'v2', exported_file_size: null }
            ]
                ; (prisma.user_document_versions.findMany as jest.Mock).mockResolvedValue(mockVersions)

            const response = await GET(createMockRequest('http://local'), params)
            const { status, data } = await validateResponse(response)

            expect(status).toBe(200)
            expect(data).toHaveLength(2)
            // BigInt should be stringified
            expect((data as any)[0].exported_file_size).toBe('100')
            expect((data as any)[1].exported_file_size).toBeNull()
        })

        it('should handle database errors during GET', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.user_document_versions.findMany as jest.Mock).mockRejectedValue(new Error('GET DB Error'))

            const response = await GET(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)

            expect(status).toBe(500)
            expect(error).toBe('GET DB Error')
        })
    })
})
