import { GET, PUT, DELETE } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/utils/roles'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        documents: {
            findUnique: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn()
        }
    }
}))

jest.mock('@/lib/utils/roles', () => ({
    isAdmin: jest.fn()
}))

describe('Document by ID API', () => {
    const mockUser = { id: 'user-123' }
    const docId = 'doc-123'
    const mockSupabase = {
        auth: {
            getUser: jest.fn()
        }
    }
    const params = { params: Promise.resolve({ id: docId }) }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
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
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
            const response = await GET(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(401)
            expect(error).toBe('Unauthorized')
        })

        it('should return 404 if document not found', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue(null)
            const response = await GET(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(404)
            expect(error).toBe('Document not found')
        })

        it('should return document with file_size converted from BigInt to Number', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            const mockDoc = {
                id: docId,
                title: 'Test Doc',
                file_size: BigInt(2048576),
                description: 'A test document',
                category: 'reports',
                tags: ['tag1', 'tag2'],
                is_featured: false,
                is_active: true,
            }
                ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue(mockDoc)

            const response = await GET(createMockRequest('http://local'), params)
            const { status, data } = await validateResponse(response) as { status: number, data: any }

            expect(status).toBe(200)
            expect(data.id).toBe(docId)
            // BigInt must be serialized to a plain Number
            expect(data.file_size).toBe(2048576)
            expect(typeof data.file_size).toBe('number')
        })

        it('should return 500 with error message when a known Error is thrown', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (prisma.documents.findUnique as jest.Mock).mockRejectedValue(new Error('DB connection lost'))
            const response = await GET(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('DB connection lost')
        })

        it('should return generic 500 message when a non-Error value is thrown', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                // Throw a plain string, not an Error object
                ; (prisma.documents.findUnique as jest.Mock).mockRejectedValue('unexpected string error')
            const response = await GET(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Internal server error')
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // PUT
    // ─────────────────────────────────────────────────────────────────────────
    describe('PUT', () => {
        it('should return 401 if not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({}) }), params)
            expect(response.status).toBe(401)
        })

        it('should return 403 if not admin', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)
            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({}) }), params)
            expect(response.status).toBe(403)
        })

        it('should return 404 if document not found on initial lookup', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
                ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue(null)
            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ title: 'x' }) }), params)
            expect(response.status).toBe(404)
        })

        it('should use document.id as rootId when document has no parent (is root)', async () => {
            // Branch: document.parent_document_id is null → rootId = document.id
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)

            const rootDoc = { id: docId, parent_document_id: null }
                ; (prisma.documents.findUnique as jest.Mock)
                    .mockResolvedValueOnce(rootDoc)
                    .mockResolvedValueOnce({ ...rootDoc, title: 'Updated', file_size: BigInt(0) })
                ; (prisma.documents.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ title: 'Updated' }) }), params)
            const { status, data } = await validateResponse(response) as { status: number, data: any }

            expect(status).toBe(200)
            // rootId should be docId itself (no parent)
            expect(prisma.documents.updateMany).toHaveBeenCalledWith(expect.objectContaining({
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
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)

            const childDoc = { id: docId, parent_document_id: 'root-doc-456' }
                ; (prisma.documents.findUnique as jest.Mock)
                    .mockResolvedValueOnce(childDoc)
                    .mockResolvedValueOnce({ ...childDoc, title: 'Updated', file_size: BigInt(0) })
                ; (prisma.documents.updateMany as jest.Mock).mockResolvedValue({ count: 3 })

            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ title: 'Updated' }) }), params)
            const { status, data } = await validateResponse(response) as { status: number, data: any }

            expect(status).toBe(200)
            expect(prisma.documents.updateMany).toHaveBeenCalledWith(expect.objectContaining({
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
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)

            const doc = { id: docId, parent_document_id: null }
            const fullBody = {
                title: 'New Title',
                description: 'New description',
                category: 'legal',
                tags: ['legal', 'contract'],
                is_featured: true,
                is_active: false,
                searchable_content: 'full text content here',
            }
                ; (prisma.documents.findUnique as jest.Mock)
                    .mockResolvedValueOnce(doc)
                    .mockResolvedValueOnce({ ...doc, ...fullBody, file_size: BigInt(0) })
                ; (prisma.documents.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify(fullBody) }), params)
            const { status } = await validateResponse(response)

            expect(status).toBe(200)
            expect(prisma.documents.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    title: 'New Title',
                    description: 'New description',
                    category: 'legal',
                    tags: ['legal', 'contract'],
                    is_featured: true,
                    is_active: false,
                    searchable_content: 'full text content here',
                })
            }))
        })

        it('should only update fields that are explicitly provided (undefined fields are skipped)', async () => {
            // Covers the negative branch: fields NOT in body are NOT included in updateData
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)

            const doc = { id: docId, parent_document_id: null }
                ; (prisma.documents.findUnique as jest.Mock)
                    .mockResolvedValueOnce(doc)
                    .mockResolvedValueOnce({ ...doc, title: 'Only Title', file_size: BigInt(0) })
                ; (prisma.documents.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

            await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ title: 'Only Title' }) }), params)

            const callArg = (prisma.documents.updateMany as jest.Mock).mock.calls[0][0]
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
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)

            const doc = { id: docId, parent_document_id: null }
                ; (prisma.documents.findUnique as jest.Mock)
                    .mockResolvedValueOnce(doc)   // initial lookup succeeds
                    .mockResolvedValueOnce(null)  // post-update lookup returns null (deleted in race)
                ; (prisma.documents.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({ title: 'x' }) }), params)
            expect(response.status).toBe(404)
        })

        it('should return 500 with error message when a known Error is thrown', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
                ; (prisma.documents.findUnique as jest.Mock).mockRejectedValue(new Error('Prisma timeout'))
            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({}) }), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Prisma timeout')
        })

        it('should return generic 500 message when a non-Error value is thrown', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
                ; (prisma.documents.findUnique as jest.Mock).mockRejectedValue({ code: 'P2025' })
            const response = await PUT(createMockRequest('http://local', { method: 'PUT', body: JSON.stringify({}) }), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Internal server error')
        })
    })

    // ─────────────────────────────────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────────────────────────────────
    describe('DELETE', () => {
        it('should return 401 if not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
            const response = await DELETE(createMockRequest('http://local'), params)
            expect(response.status).toBe(401)
        })

        it('should return 403 if not admin', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)
            const response = await DELETE(createMockRequest('http://local'), params)
            expect(response.status).toBe(403)
        })

        it('should return 404 if document not found', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
                ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue(null)
            const response = await DELETE(createMockRequest('http://local'), params)
            expect(response.status).toBe(404)
        })

        it('should delete document and return file_path for client-side storage cleanup', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)

            const mockDoc = { file_path: 'uploads/2024/report.pdf' }
                ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue(mockDoc)
                ; (prisma.documents.delete as jest.Mock).mockResolvedValue({})

            const response = await DELETE(createMockRequest('http://local'), params)
            const { status, data } = await validateResponse(response) as { status: number, data: any }

            expect(status).toBe(200)
            expect(data.message).toBe('Document deleted successfully')
            expect(data.file_path).toBe('uploads/2024/report.pdf')
            expect(prisma.documents.delete).toHaveBeenCalledWith({ where: { id: docId } })
        })

        it('should only select file_path on lookup (not full document)', async () => {
            // Verifies the select: { file_path: true } is used — not fetching unnecessary data
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
                ; (prisma.documents.findUnique as jest.Mock).mockResolvedValue({ file_path: 'path/to/file.pdf' })
                ; (prisma.documents.delete as jest.Mock).mockResolvedValue({})

            await DELETE(createMockRequest('http://local'), params)

            expect(prisma.documents.findUnique).toHaveBeenCalledWith({
                where: { id: docId },
                select: { file_path: true }
            })
        })

        it('should return 500 with error message when a known Error is thrown', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
                ; (prisma.documents.findUnique as jest.Mock).mockRejectedValue(new Error('Foreign key constraint'))
            const response = await DELETE(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Foreign key constraint')
        })

        it('should return generic 500 message when a non-Error value is thrown', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
                ; (prisma.documents.findUnique as jest.Mock).mockRejectedValue(null)
            const response = await DELETE(createMockRequest('http://local'), params)
            const { status, error } = await validateResponse(response)
            expect(status).toBe(500)
            expect(error).toBe('Internal server error')
        })
    })
})
