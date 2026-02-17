import { POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/utils/roles'
import { ERROR_MESSAGES, STORAGE_BUCKETS } from '@/constants'
import { DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'
import { uploadTemplateToDrive } from '@/actions/google-docs'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/prisma', () => ({
    prisma: (require('jest-mock-extended') as any).mockDeep(),
}))
jest.mock('@/lib/utils/roles')
jest.mock('@/actions/google-docs')

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Document Upload API', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000'
    const mockUser = { id: mockUserId, email: 'user@example.com' }

    // Helper to create a multi-part form data request
    const createUploadRequest = (fields: Record<string, any>, fileContent = 'test data', fileName = 'test.pdf', fileType = 'application/pdf') => {
        const formData = new FormData()
        if (fields.file !== null && fields.file !== undefined) {
            // Use explicit case for null to skip file
        } else if (fields.file === null) {
            // skip
        } else {
            const blob = new Blob([fileContent], { type: fileType })
            formData.append('file', blob, fileName)
        }

        Object.entries(fields).forEach(([key, value]) => {
            if (key !== 'file' && value !== undefined) {
                formData.append(key, value)
            }
        })

        // Bypass createMockRequest to avoid 'application/json' default header
        return new Request('http://localhost/api/documents/upload', {
            method: 'POST',
            body: formData
        })
    }

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { })
        jest.spyOn(console, 'error').mockImplementation(() => { })
        jest.spyOn(console, 'warn').mockImplementation(() => { })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should return 401 if user is not authenticated', async () => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
        })

        const request = createUploadRequest({})
        const response = await POST(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(401)
        expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
    })

    it('should return 403 if user lacks upload permission', async () => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
        })
            ; (hasPermission as jest.Mock).mockResolvedValue(false)

        const request = createUploadRequest({})
        const response = await POST(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(403)
        expect(error).toBe(ERROR_MESSAGES.PERMISSION_REQUIRED_UPLOAD_DOCUMENTS)
    })

    it('should return 400 if required fields are missing', async () => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
        })
            ; (hasPermission as jest.Mock).mockResolvedValue(true)

        // Missing file
        const request = createUploadRequest({ file: null })
        const response = await POST(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(400)
        expect(error).toBe(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS)
    })

    describe('File Upload Logic', () => {
        const validFields = {
            title: 'Test Doc',
            category: 'technical',
            description: 'Test description',
            tags: '["tag1", "tag2"]'
        }

        const mockStorage = {
            from: jest.fn().mockReturnThis(),
            upload: jest.fn().mockResolvedValue({ error: null })
        }

        beforeEach(() => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
                storage: mockStorage
            })
                ; (hasPermission as jest.Mock).mockResolvedValue(true)
        })

        it('should upload a new root document successfully', async () => {
            prismaMock.documents.create.mockResolvedValue({
                id: 'new-id',
                title: validFields.title,
                file_size: BigInt(9),
                version: '1.0'
            } as any)

            const request = createUploadRequest(validFields)
            const response = await POST(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(201)
            expect(data.version).toBe('1.0')
            expect(mockStorage.from).toHaveBeenCalledWith(STORAGE_BUCKETS.DOCUMENTS)
            expect(prismaMock.documents.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    parent_document_id: null
                })
            }))
        })

        it('should handle alternative tag formats (comma-separated)', async () => {
            prismaMock.documents.create.mockResolvedValue({
                id: 'new-id',
                file_size: BigInt(9)
            } as any)

            const request = createUploadRequest({ ...validFields, tags: 'tag1, tag2' })
            await POST(request)

            expect(prismaMock.documents.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    tags: ['tag1', 'tag2']
                })
            }))
        })

        it('should return 400 if storage upload fails', async () => {
            mockStorage.upload.mockResolvedValueOnce({ error: { message: 'Upload Error' } })

            const request = createUploadRequest(validFields)
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(400)
            expect(error).toContain('Upload failed: Upload Error')
        })

        describe('Versioning', () => {
            it('should upload a new version and increment version number correctly', async () => {
                const parentId = 'doc-1'
                prismaMock.documents.findUnique.mockResolvedValue({
                    id: parentId,
                    version: '1.1',
                    parent_document_id: null
                } as any)
                prismaMock.documents.findMany.mockResolvedValue([
                    { version: '1.0' },
                    { version: '1.1' }
                ] as any)
                prismaMock.documents.create.mockResolvedValue({
                    id: 'new-id',
                    version: '1.2',
                    file_size: BigInt(9)
                } as any)

                const request = createUploadRequest({ ...validFields, parent_document_id: parentId })
                const response = await POST(request)
                const { status, data } = await validateResponse<any>(response)

                expect(status).toBe(201)
                expect(data.version).toBe('1.2')
                expect(prismaMock.documents.create).toHaveBeenCalledWith(expect.objectContaining({
                    data: expect.objectContaining({
                        parent_document_id: parentId
                    })
                }))
            })

            it('should handle parent with no valid version numbers', async () => {
                const parentId = 'doc-1'
                prismaMock.documents.findUnique.mockResolvedValue({ id: parentId, version: null } as any)
                prismaMock.documents.findMany.mockResolvedValue([{ version: 'invalid' }] as any)
                prismaMock.documents.create.mockResolvedValue({ id: 'id', file_size: BigInt(1), version: '0.1' } as any)

                const request = createUploadRequest({ ...validFields, parent_document_id: parentId })
                const response = await POST(request)
                const { data } = await validateResponse<any>(response)
                expect(data.version).toBe('0.1')
            })

            it('should handle version fallback when version field is null', async () => {
                const parentId = 'doc-1'
                prismaMock.documents.findUnique.mockResolvedValue({ id: parentId, version: '1.0' } as any)
                prismaMock.documents.findMany.mockResolvedValue([{ version: null }] as any)
                prismaMock.documents.create.mockResolvedValue({ id: 'id', file_size: BigInt(1), version: '1.1' } as any)

                const request = createUploadRequest({ ...validFields, parent_document_id: parentId })
                await POST(request)
                expect(prismaMock.documents.create).toHaveBeenCalledWith(expect.objectContaining({
                    data: expect.objectContaining({
                        version: '1.1'
                    })
                }))
            })

            it('should handle versioning from a sub-version (find root)', async () => {
                const subversionId = 'sub-1'
                const rootId = 'root-1'
                prismaMock.documents.findUnique.mockResolvedValue({
                    id: subversionId,
                    version: '1.1',
                    parent_document_id: rootId
                } as any)
                prismaMock.documents.findMany.mockResolvedValue([{ version: '1.1' }] as any)
                prismaMock.documents.create.mockResolvedValue({
                    id: 'new-id',
                    version: '1.2',
                    file_size: BigInt(9)
                } as any)

                const request = createUploadRequest({ ...validFields, parent_document_id: subversionId })
                await POST(request)

                expect(prismaMock.documents.create).toHaveBeenCalledWith(expect.objectContaining({
                    data: expect.objectContaining({
                        parent_document_id: rootId
                    })
                }))
            })

            it('should return 404 if parent document not found', async () => {
                prismaMock.documents.findUnique.mockResolvedValue(null)

                const request = createUploadRequest({ ...validFields, parent_document_id: 'nonexistent' })
                const response = await POST(request)
                const { status, error } = await validateResponse<any>(response)

                expect(status).toBe(404)
                expect(error).toBe(ERROR_MESSAGES.PARENT_DOCUMENT_NOT_FOUND)
            })
        })

        describe('Google Drive Integration', () => {
            it('should trigger drive upload for DOCX files', async () => {
                ; (uploadTemplateToDrive as jest.Mock).mockResolvedValue('drive-id')
                prismaMock.documents.create.mockResolvedValue({
                    id: 'new-id',
                    file_size: BigInt(9),
                    google_drive_template_id: 'drive-id'
                } as any)

                const request = createUploadRequest(validFields, 'docx content', 'test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                const response = await POST(request)
                const { status } = await validateResponse<any>(response)
                expect(status).toBe(201)
                expect(uploadTemplateToDrive).toHaveBeenCalled()
            })

            it('should handle Google Drive upload failure gracefully (Error instance)', async () => {
                const driveError = new Error('Drive Panic')
                    ; (uploadTemplateToDrive as jest.Mock).mockRejectedValue(driveError)
                prismaMock.documents.create.mockResolvedValue({
                    id: 'new-id',
                    file_size: BigInt(9),
                    google_drive_template_id: null
                } as any)

                const request = createUploadRequest(validFields, 'docx content', 'test.docx')
                await POST(request)

                // Verify console.error was called with the error object
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Google Drive Conversion Failed'), driveError)
            })

            it('should handle Google Drive upload failure gracefully (non-Error)', async () => {
                ; (uploadTemplateToDrive as jest.Mock).mockRejectedValue('Drive exploded')
                prismaMock.documents.create.mockResolvedValue({
                    id: 'new-id',
                    file_size: BigInt(9),
                    google_drive_template_id: null
                } as any)

                const request = createUploadRequest(validFields, 'docx content', 'test.docx')
                await POST(request)
                expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Google Drive Conversion Failed'), 'Drive exploded')
            })

            it('should skip drive upload for non-docx files', async () => {
                const request = createUploadRequest(validFields, 'pdf content', 'test.pdf', 'application/pdf')
                await POST(request)
                expect(uploadTemplateToDrive).not.toHaveBeenCalled()
            })

            it('should detect various file types correctly including no extension', async () => {
                const types = [
                    { name: 'test.doc', type: 'document' },
                    { name: 'test.xls', type: 'spreadsheet' },
                    { name: 'test.xlsx', type: 'spreadsheet' },
                    { name: 'test.zip', type: 'archive' },
                    { name: 'test.unknown', type: 'other' },
                    { name: 'noext', type: 'other' }
                ]

                for (const t of types) {
                    prismaMock.documents.create.mockResolvedValueOnce({ id: 'id', file_size: BigInt(1) } as any)
                    const request = createUploadRequest(validFields, 'content', t.name)
                    await POST(request)
                    expect(prismaMock.documents.create).toHaveBeenLastCalledWith(expect.objectContaining({
                        data: expect.objectContaining({
                            file_type: t.type
                        })
                    }))
                }
            })

            it('should hit drive upload with MIME type and docx extension', async () => {
                ; (uploadTemplateToDrive as jest.Mock).mockResolvedValue('drive-id')
                prismaMock.documents.create.mockResolvedValue({ id: 'id', file_size: BigInt(1) } as any)

                const request = createUploadRequest(validFields, 'content', 'test.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                await POST(request)
                expect(uploadTemplateToDrive).toHaveBeenCalled()
            })

            it('should hit drive upload with MIME type only (but it will skip due to fileType check)', async () => {
                // This test documents current behavior: fileType MUST be document too
                ; (uploadTemplateToDrive as jest.Mock).mockResolvedValue('drive-id')
                prismaMock.documents.create.mockResolvedValue({ id: 'id', file_size: BigInt(1) } as any)

                const request = createUploadRequest(validFields, 'content', 'no-ext', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                await POST(request)
                expect(uploadTemplateToDrive).not.toHaveBeenCalled()
            })
        })

        it('should use default values for searchable_content and featured flags', async () => {
            prismaMock.documents.create.mockResolvedValue({ id: 'id', file_size: BigInt(1) } as any)
            const request = createUploadRequest({ title: 'T', category: 'C' })
            await POST(request)

            expect(prismaMock.documents.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    searchable_content: null,
                    is_featured: false
                })
            }))
        })
    })

    it('should return 500 if prisma throws', async () => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
            storage: { from: jest.fn().mockReturnThis(), upload: jest.fn().mockResolvedValue({ error: null }) }
        })
            ; (hasPermission as jest.Mock).mockResolvedValue(true)
        prismaMock.documents.create.mockRejectedValue(new Error('Database error'))

        const request = createUploadRequest({ title: 'T', category: 'C' })
        const response = await POST(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(500)
        expect(error).toBe('Database error')
    })

    it('should return 500 if a non-Error object is thrown', async () => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
            storage: { from: jest.fn().mockReturnThis(), upload: jest.fn().mockResolvedValue({ error: null }) }
        })
            ; (hasPermission as jest.Mock).mockResolvedValue(true)
        prismaMock.documents.create.mockRejectedValue('Critical DB Failure')

        const request = createUploadRequest({ title: 'T', category: 'C' })
        const response = await POST(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(500)
        expect(error).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    })
})
