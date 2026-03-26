import { uploadTemplateToDrive, createEditingSession, finishEditingSession, convertDocumentAction } from './google-docs'
import { prismaMock } from '@/lib/__mocks__/prisma'
import { createSupabaseMock, setupSupabaseMock } from '@/test/utils/supabase-mock'

// Mock dependencies
jest.mock('@/lib/supabase/server')

// Mock googleapis
jest.mock('googleapis', () => ({
    google: {
        auth: {
            GoogleAuth: jest.fn(() => ({
                getCredentials: jest.fn(),
            }))
        },
        drive: jest.fn(() => ({
            files: {
                copy: jest.fn(),
                export: jest.fn(),
            }
        })),
        docs: jest.fn(() => ({
            documents: {
                get: jest.fn(),
            }
        }))
    }
}))

// Mock global fetch
global.fetch = jest.fn()

describe('Google Docs Actions', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000'
    const mockUser = { id: mockUserId, email: 'test@example.com' }
    let mockSupabase: any

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'log').mockImplementation(() => { })
        jest.spyOn(console, 'error').mockImplementation(() => { })
        
        process.env.GOOGLE_BRIDGE_URL = 'https://script.google.com/macros/s/xxx/exec'
        process.env.GOOGLE_BRIDGE_SECRET = 'secret-123'
        process.env.GOOGLE_DRIVE_FOLDER_ID = 'folder-123'
        process.env.GOOGLE_CLIENT_EMAIL = 'test@example.com'
        process.env.GOOGLE_PRIVATE_KEY = 'private-key'

        mockSupabase = createSupabaseMock({ user: mockUser })
        setupSupabaseMock(mockSupabase)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('Environment Checks', () => {
        it('should throw if bridge config is missing', async () => {
            const originalUrl = process.env.GOOGLE_BRIDGE_URL
            delete process.env.GOOGLE_BRIDGE_URL
            try {
                await expect(uploadTemplateToDrive(Buffer.from('test'), 'test.docx'))
                    .rejects.toThrow('Google Bridge not configured')
            } finally {
                process.env.GOOGLE_BRIDGE_URL = originalUrl
            }
        })
    })

    describe('uploadTemplateToDrive', () => {
        const mockBuffer = Buffer.from('test content')
        const mockFileName = 'test.docx'

        it('should throw if user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            await expect(uploadTemplateToDrive(mockBuffer, mockFileName))
                .rejects.toThrow('Unauthorized')
        })

        it('should successfully upload template via bridge', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                json: () => Promise.resolve({ id: 'file-123' })
            })

            const result = await uploadTemplateToDrive(mockBuffer, mockFileName)
            expect(result).toBe('file-123')
            expect(global.fetch).toHaveBeenCalledWith(
                process.env.GOOGLE_BRIDGE_URL,
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"action":"upload"')
                })
            )
        })

        it('should throw if bridge returns error', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                json: () => Promise.resolve({ error: 'Bridge failed' })
            })

            await expect(uploadTemplateToDrive(mockBuffer, mockFileName))
                .rejects.toThrow('Bridge Error: Bridge failed')
        })

        it('should throw if bridge returns no id', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                json: () => Promise.resolve({ success: true }) // no id
            })
            await expect(uploadTemplateToDrive(mockBuffer, mockFileName))
                .rejects.toThrow('Failed to get File ID from Bridge')
        })
    })

    describe('createEditingSession', () => {
        const documentId = '550e8400-e29b-41d4-a716-446655440001'
        const templateFileId = 'template-123'

        it('should throw if user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            await expect(createEditingSession(documentId, templateFileId))
                .rejects.toThrow('You must be logged in to edit documents')
        })

        it('should create a new editing session and version', async () => {
            // Mock bridge copy response
            (global.fetch as jest.Mock).mockResolvedValue({
                json: () => Promise.resolve({ id: 'new-file-123' })
            })

            // Mock prisma responses
            prismaMock.user_document_versions.findFirst.mockResolvedValue({ version_number: 1 } as any)
            prismaMock.user_document_versions.create.mockResolvedValue({ id: '550e8400-e29b-41d4-a716-446655440002' } as any)

            const result = await createEditingSession(documentId, templateFileId)

            expect(result).toEqual({
                success: true,
                editUrl: 'https://docs.google.com/document/d/new-file-123/edit',
                versionId: '550e8400-e29b-41d4-a716-446655440002'
            })

            expect(prismaMock.user_document_versions.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    version_number: 2,
                    user_id: mockUserId,
                    is_draft: true
                })
            }))
        })

        it('should handle bridge copy failure', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                json: () => Promise.resolve({ error: 'Copy failed' })
            })

            await expect(createEditingSession(documentId, templateFileId))
                .rejects.toThrow('Failed to start editing session')
        })
    })

    describe('finishEditingSession', () => {
        const versionId = '550e8400-e29b-41d4-a716-446655440002'
        const mockVersion = {
            id: versionId,
            user_id: mockUserId,
            google_drive_file_id: 'g-file-123',
            original_document_id: '550e8400-e29b-41d4-a716-446655440001'
        }

        it('should throw if user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            await expect(finishEditingSession(versionId))
                .rejects.toThrow('Unauthorized')
        })

        it('should throw if version not found or unauthorized', async () => {
            prismaMock.user_document_versions.findUnique.mockResolvedValue(null)
            await expect(finishEditingSession(versionId))
                .rejects.toThrow('Version not found or unauthorized')
        })

        it('should successfully finish session and export file', async () => {
            prismaMock.user_document_versions.findUnique.mockResolvedValue(mockVersion as any)

            // Mock bridge export response
            const mockBase64 = Buffer.from('docx-content').toString('base64');
            (global.fetch as jest.Mock).mockResolvedValue({
                json: () => Promise.resolve({ base64: mockBase64 })
            })

            // Mock Supabase storage
            mockSupabase.storage.from().upload.mockResolvedValue({ data: { path: 'path/to/file' }, error: null })
            mockSupabase.storage.from().createSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://download-link' }, error: null })

            const result = await finishEditingSession(versionId)

            expect(result).toEqual({
                success: true,
                fileUrl: 'https://download-link'
            })

            // Verify DB updates
            expect(prismaMock.user_document_versions.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: versionId },
                data: expect.objectContaining({ is_draft: false })
            }))
            expect(prismaMock.download_logs.create).toHaveBeenCalled()
        })

        it('should throw if no google drive file id', async () => {
            prismaMock.user_document_versions.findUnique.mockResolvedValue({ ...mockVersion, google_drive_file_id: null } as any)
            await expect(finishEditingSession(versionId))
                .rejects.toThrow('No Google Drive file associated with this version')
        })

        it('should throw if bridge export returns empty data', async () => {
            prismaMock.user_document_versions.findUnique.mockResolvedValue(mockVersion as any);
            (global.fetch as jest.Mock).mockResolvedValue({
                json: () => Promise.resolve({ base64: null })
            })

            await expect(finishEditingSession(versionId))
                .rejects.toThrow('Bridge returned empty DOCX data')
        })

        it('should throw if supabase upload fails', async () => {
            prismaMock.user_document_versions.findUnique.mockResolvedValue(mockVersion as any);
            (global.fetch as jest.Mock).mockResolvedValue({
                json: () => Promise.resolve({ base64: 'base64' })
            })
            mockSupabase.storage.from().upload.mockResolvedValue({ error: { message: 'Upload failed' } })

            await expect(finishEditingSession(versionId))
                .rejects.toThrow('Upload failed: Upload failed')
        })

        it('should throw if signed url generation fails', async () => {
            prismaMock.user_document_versions.findUnique.mockResolvedValue(mockVersion as any);
            (global.fetch as jest.Mock).mockResolvedValue({
                json: () => Promise.resolve({ base64: 'base64' })
            })
            mockSupabase.storage.from().upload.mockResolvedValue({ data: { path: 'path' }, error: null })
            mockSupabase.storage.from().createSignedUrl.mockResolvedValue({ error: { message: 'URL failed' } })

            await expect(finishEditingSession(versionId))
                .rejects.toThrow('Failed to generate download URL')
        })
    })

    describe('convertDocumentAction', () => {
        const docId = '550e8400-e29b-41d4-a716-446655440001'
        const mockDoc = {
            id: docId,
            file_path: 'docs/file.docx',
            file_name: 'file.docx',
            mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }

        it('should successfully convert document', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(mockDoc as any)

            // Mock Supabase download
            const mockBlob = new Blob(['content'])
            mockSupabase.storage.from().download.mockResolvedValue({ data: mockBlob, error: null });

            // Mock bridge upload
            (global.fetch as jest.Mock).mockResolvedValue({
                json: () => Promise.resolve({ id: 'new-template-123' })
            })

            const result = await convertDocumentAction(docId)

            expect(result).toEqual({ success: true, googleDriveTemplateId: 'new-template-123' })
            expect(prismaMock.documents.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: docId },
                data: { google_drive_template_id: 'new-template-123' }
            }))
        })

        it('should throw if document not found', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(null)
            await expect(convertDocumentAction(docId))
                .rejects.toThrow('Document not found')
        })

        it('should throw if download fails', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(mockDoc as any)
            mockSupabase.storage.from().download.mockResolvedValue({ error: { message: 'Download error' } })

            await expect(convertDocumentAction(docId))
                .rejects.toThrow('Failed to download file from storage: Download error')
        })
    })
})
