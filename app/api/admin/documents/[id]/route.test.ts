import { GET, PUT, DELETE } from './route'
import { prismaMock } from '../../../../_lib/__mocks__/prisma'
import { isAdmin } from '../../../../_utils/admin/roles'
import { ERROR_MESSAGES } from '../../../../_constants/admin'
import { createMockRequest, validateResponse, cleanupMocks } from '../../../../../test/utils/handler-utils'
import { createSupabaseMock, setupSupabaseMock } from '../../../../../test/utils/supabase-mock'

// Mock dependencies
jest.mock('../../../../_lib/supabase/server')
jest.mock('../../../../_utils/admin/roles')

describe('Document by ID API', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const docId = 'doc-123'
    const params = { params: Promise.resolve({ id: docId }) }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    // ─────────────────────────────────────────────────────────────────────────
    // GET
    // ─────────────────────────────────────────────────────────────────────────
    describe('GET', () => {
        it('should return 401 if not authenticated', async () => {
            setupSupabaseMock(createSupabaseMock({ user: null }))
            const response = await GET(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(401)
            expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
        })

        it('should return 404 if document not found', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            prismaMock.documents.findUnique.mockResolvedValue(null)
            const response = await GET(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(404)
            expect(error).toBe(ERROR_MESSAGES.DOCUMENT_NOT_FOUND)
        })

        it('should return document with file_size converted from BigInt to Number', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            const mockDoc = {
                id: docId,
                title: 'Test Doc',
                file_size: BigInt(2048576),
                description: 'A test document',
                category: 'reports',
                is_featured: false,
                is_active: true,
                file_name: 'test.pdf',
                file_path: 'uploads/test.pdf',
                file_type: 'pdf',
                mime_type: 'application/pdf',
                version: '1.0',
                created_by: 'user-123',
                created_at: new Date(),
                updated_at: new Date(),
                searchable_content: null,
                parent_document_id: null,
                google_drive_file_id: null,
                google_drive_link: null,
                thumbnail_path: null,
                is_deleted: false,
                deleted_at: null,
                google_drive_template_id: null
            }
            prismaMock.documents.findUnique.mockResolvedValue(mockDoc as any)

            const response = await GET(createMockRequest('http://local'), params)
            const { status, data } = await validateResponse(response) as { status: number, data: any }

            expect(status).toBe(200)
            expect(data.id).toBe(docId)
            // BigInt must be serialized to a plain Number
            expect(data.file_size).toBe(2048576)
            expect(typeof data.file_size).toBe('number')
        })

        it('should return 500 with error message when a known Error is thrown', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            prismaMock.documents.findUnique.mockRejectedValue(new Error('DB connection lost'))
            const response = await GET(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('DB connection lost')
        })

        it('should return generic 500 message when a non-Error value is thrown', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            // Throw a plain string, not an Error object
            prismaMock.documents.findUnique.mockRejectedValue('unexpected string error')
            const response = await GET(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // PUT
    // ─────────────────────────────────────────────────────────────────────────
    describe('PUT', () => {
        it('should return 401 if not authenticated', async () => {
            setupSupabaseMock(createSupabaseMock({ user: null }))
            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({}) }), params)
            expect(response.status).toBe(401)
        })

        it('should return 403 if not admin', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(false)
            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({}) }), params)
            expect(response.status).toBe(403)
        })

        it('should return 404 if document not found on initial lookup', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.documents.findUnique.mockResolvedValue(null)
            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ title: 'x' }) }), params)
            expect(response.status).toBe(404)
        })

        it('should use document.id as rootId when document has no parent (is root)', async () => {
            // Branch: document.parent_document_id is null → rootId = document.id
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)

            const rootDoc = { id: docId, parent_document_id: null }
            prismaMock.documents.findUnique
                .mockResolvedValueOnce(rootDoc as any)
                .mockResolvedValueOnce({ ...rootDoc, title: 'Updated', file_size: BigInt(0) } as any)
            prismaMock.documents.updateMany.mockResolvedValue({ count: 1 })

            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ title: 'Updated' }) }), params)
            const { status, data } = await validateResponse(response) as { status: number, data: any }

            expect(status).toBe(200)
            // rootId should be docId itself (no parent)
            expect(prismaMock.documents.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    OR: [
                        { id: docId },
                        { parent_document_id: docId }
                    ]
                }
            }))
            expect(data.versionsUpdated).toBe(1)
        })

        it('should use parent_document_id as rootId when document is a child version', async () => {
            // Branch: document.parent_document_id is set → rootId = parent_document_id
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)

            const childDoc = { id: docId, parent_document_id: 'root-doc-456' }
            prismaMock.documents.findUnique
                .mockResolvedValueOnce(childDoc as any)
                .mockResolvedValueOnce({ ...childDoc, title: 'Updated', file_size: BigInt(0) } as any)
            prismaMock.documents.updateMany.mockResolvedValue({ count: 3 })

            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ title: 'Updated' }) }), params)
            const { status, data } = await validateResponse(response) as { status: number, data: any }

            expect(status).toBe(200)
            expect(prismaMock.documents.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    OR: [
                        { id: 'root-doc-456' },
                        { parent_document_id: 'root-doc-456' }
                    ]
                }
            }))
            expect(data.versionsUpdated).toBe(3)
        })

        it('should update all supported metadata fields when provided', async () => {
            // Covers all the `if (body.X !== undefined)` branches
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)

            const doc = { id: docId, parent_document_id: null }
            const fullBody = {
                title: 'New Title',
                description: 'New description',
                category: 'legal',
                is_featured: true,
                is_active: false,
                searchable_content: 'full text content here',
            }
            prismaMock.documents.findUnique
                .mockResolvedValueOnce(doc as any)
                .mockResolvedValueOnce({ ...doc, ...fullBody, file_size: BigInt(0) } as any)
            prismaMock.documents.updateMany.mockResolvedValue({ count: 1 })

            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify(fullBody) }), params)
            const { status } = await validateResponse(response)

            expect(status).toBe(200)
            expect(prismaMock.documents.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    title: 'New Title',
                    description: 'New description',
                    category: 'legal',
                    is_featured: true,
                    is_active: false,
                    searchable_content: 'full text content here',
                })
            }))
        })

        it('should only update fields that are explicitly provided (undefined fields are skipped)', async () => {
            // Covers the negative branch: fields NOT in body are NOT included in updateData
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)

            const doc = { id: docId, parent_document_id: null }
            prismaMock.documents.findUnique
                .mockResolvedValueOnce(doc as any)
                .mockResolvedValueOnce({ ...doc, title: 'Only Title', file_size: BigInt(0) } as any)
            prismaMock.documents.updateMany.mockResolvedValue({ count: 1 })

            await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ title: 'Only Title' }) }), params)

            const callArg = (prismaMock.documents.updateMany as jest.Mock).mock.calls[0][0]
            // title should be set
            expect(callArg.data.title).toBe('Only Title')
            // description, category, tags etc. should NOT be set
            expect(callArg.data.description).toBeUndefined()
            expect(callArg.data.category).toBeUndefined()
            expect(callArg.data.tags).toBeUndefined()
            expect(callArg.data.is_featured).toBeUndefined()
            expect(callArg.data.is_active).toBeUndefined()
            expect(callArg.data.searchable_content).toBeUndefined()
        })

        it('should return 404 if document disappears after updateMany (race condition)', async () => {
            // Branch: line 125 — updatedDocument is null after updateMany
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)

            const doc = { id: docId, parent_document_id: null }
            prismaMock.documents.findUnique
                .mockResolvedValueOnce(doc as any)   // initial lookup succeeds
                .mockResolvedValueOnce(null)  // post-update lookup returns null (deleted in race)
            prismaMock.documents.updateMany.mockResolvedValue({ count: 1 })

            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ title: 'x' }) }), params)
            expect(response.status).toBe(404)
        })

        it('should return 500 with error message when a known Error is thrown', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.documents.findUnique.mockRejectedValue(new Error('Prisma timeout'))
            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({}) }), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Prisma timeout')
        })

        it('should return generic 500 message when a non-Error value is thrown', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.documents.findUnique.mockRejectedValue({ code: 'P2025' })
            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({}) }), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────
    describe('DELETE', () => {
        it('should return 401 if not authenticated', async () => {
            setupSupabaseMock(createSupabaseMock({ user: null }))
            const response = await DELETE(createMockRequest('http://local'), params)
            expect(response.status).toBe(401)
        })

        it('should return 403 if not admin', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(false)
            const response = await DELETE(createMockRequest('http://local'), params)
            expect(response.status).toBe(403)
        })

        it('should return 404 if document not found', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.documents.findUnique.mockResolvedValue(null)
            const response = await DELETE(createMockRequest('http://local'), params)
            expect(response.status).toBe(404)
        })

        it('should delete document and return file_path for client-side storage cleanup', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)

            const mockDoc = { file_path: 'uploads/2024/report.pdf' }
            prismaMock.documents.findUnique.mockResolvedValue(mockDoc as any)
            prismaMock.documents.delete.mockResolvedValue({} as any)

            const response = await DELETE(createMockRequest('http://local'), params)
            const { status, data } = await validateResponse(response) as { status: number, data: any }

            expect(status).toBe(200)
            expect(data.message).toBe('Document deleted successfully')
            expect(data.file_path).toBe('uploads/2024/report.pdf')
            expect(prismaMock.documents.delete).toHaveBeenCalledWith({ where: { id: docId } })
        })

        it('should only select file_path on lookup (not full document)', async () => {
            // Verifies the select: { file_path: true } is used — not fetching unnecessary data
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.documents.findUnique.mockResolvedValue({ file_path: 'path/to/file.pdf' } as any)
            prismaMock.documents.delete.mockResolvedValue({} as any)

            await DELETE(createMockRequest('http://local'), params)

            expect(prismaMock.documents.findUnique).toHaveBeenCalledWith({
                where: { id: docId },
                select: { file_path: true }
            })
        })

        it('should return 500 with error message when a known Error is thrown', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.documents.findUnique.mockRejectedValue(new Error('Foreign key constraint'))
            const response = await DELETE(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Foreign key constraint')
        })

        it('should return generic 500 message when a non-Error value is thrown', async () => {
            setupSupabaseMock(createSupabaseMock({ user: mockUser }))
            ;(isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.documents.findUnique.mockRejectedValue(null)
            const response = await DELETE(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
        })
    })
})
