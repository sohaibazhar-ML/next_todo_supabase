import { POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createMockRequest, validateResponse } from '@/test/utils/handler-utils'
import { Document, Packer, HeadingLevel, AlignmentType, UnderlineType } from 'docx'
import { PDFDocument } from 'pdf-lib'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        user_document_versions: {
            findUnique: jest.fn(),
            update: jest.fn()
        }
    }
}))

// Mock docx and pdf-lib to avoid actual generation overhead during tests
jest.mock('docx', () => ({
    Document: jest.fn(),
    Packer: { toBuffer: jest.fn() },
    Paragraph: jest.fn().mockImplementation((opts) => opts),
    TextRun: jest.fn().mockImplementation((opts) => opts),
    HeadingLevel: {
        HEADING_1: 'h1',
        HEADING_2: 'h2',
        HEADING_3: 'h3',
        HEADING_4: 'h4',
        HEADING_5: 'h5',
        HEADING_6: 'h6',
    },
    AlignmentType: {
        CENTER: 'center',
        RIGHT: 'right',
        JUSTIFIED: 'justify',
        LEFT: 'left'
    },
    UnderlineType: { SINGLE: 'single' }
}))

jest.mock('pdf-lib', () => ({
    PDFDocument: {
        create: jest.fn()
    },
    rgb: jest.fn(),
    StandardFonts: { Helvetica: 'Helvetica' }
}))

describe('Document Export API', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockSupabase = {
        auth: {
            getUser: jest.fn()
        },
        storage: {
            from: jest.fn().mockReturnThis(),
            upload: jest.fn(),
            createSignedUrl: jest.fn()
        }
    }
    const docId = 'doc-123'
    const params = { params: Promise.resolve({ id: docId }) }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)

            // Reset mocks to successful defaults
            ; (Packer.toBuffer as jest.Mock).mockResolvedValue(Buffer.from('docx-content'))
            ; (PDFDocument.create as jest.Mock).mockResolvedValue({
                embedFont: jest.fn().mockResolvedValue({
                    widthOfTextAtSize: jest.fn().mockReturnValue(10)
                }),
                addPage: jest.fn().mockReturnValue({ drawText: jest.fn() }),
                save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
            })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should return 401 if not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
        const response = await POST(createMockRequest('http://local', { method: 'POST' }), params)
        expect(response.status).toBe(401)
    })

    it('should export DOCX successfully', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

        const mockVersion = {
            id: 'v1',
            user_id: mockUser.id,
            version_number: 1,
            original_file_type: 'document',
            html_content: '<p>Test</p>',
            documents: { file_name: 'test.docx', file_type: 'document' }
        }
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(mockVersion)

        mockSupabase.storage.upload.mockResolvedValue({ error: null })
        mockSupabase.storage.createSignedUrl.mockResolvedValue({ data: { signedUrl: 'link' } })

        const body = { version_id: 'v1', export_format: 'docx' }
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify(body)
        }), params)

        const { status, data } = await validateResponse(response)
        expect(status).toBe(200)
        expect(data).toHaveProperty('signedUrl', 'link')
        expect(prisma.user_document_versions.update).toHaveBeenCalled()
        expect(mockSupabase.storage.upload).toHaveBeenCalled()
    })

    it('should export PDF successfully', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

        const mockVersion = {
            id: 'v1',
            user_id: mockUser.id,
            version_number: 1,
            original_file_type: 'pdf',
            pdf_text_content: 'Test content',
            documents: { file_name: 'test.pdf', file_type: 'pdf' }
        }
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(mockVersion)

        mockSupabase.storage.upload.mockResolvedValue({ error: null })
        mockSupabase.storage.createSignedUrl.mockResolvedValue({ data: { signedUrl: 'link' } })

        const body = { version_id: 'v1', export_format: 'pdf' }
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify(body)
        }), params)

        const { status, data } = await validateResponse(response)
        expect(status).toBe(200)
        expect((data as any)).toHaveProperty('signedUrl', 'link')
    })

    it('should return 400 if version_id is missing', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ export_format: 'docx' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('Version ID is required')
    })

    it('should return 404 if version not found or unauthorized', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(null)

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'docx' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(404)
        expect(error).toContain('Version not found')
    })

    it('should return 400 for invalid export format for document type', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue({
                id: 'v1',
                user_id: mockUser.id,
                original_file_type: 'document',
                html_content: '<p>test</p>',
                documents: { file_name: 'test.docx' }
            })

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'pdf' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('Invalid export format for DOCX document')
    })

    it('should handle HTML to DOCX conversion failures', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue({
                id: 'v1',
                user_id: mockUser.id,
                original_file_type: 'document',
                html_content: '<p>test</p>',
                documents: { file_name: 'test.docx' }
            })

        const { Packer } = require('docx')
            ; (Packer.toBuffer as jest.Mock).mockRejectedValue(new Error('Conversion Error'))

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'docx' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('Conversion Error')
    })

    it('should handle storage upload errors', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue({
                id: 'v1',
                user_id: mockUser.id,
                version_number: 1,
                original_file_type: 'document',
                html_content: '<p>test</p>',
                documents: { file_name: 'test.docx' }
            })

        mockSupabase.storage.upload.mockResolvedValue({ error: { message: 'Upload Failed' } })

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'docx' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('Upload Failed')
    })

    it('should handle storage upload exceptions', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue({
                id: 'v1',
                user_id: mockUser.id,
                version_number: 1,
                original_file_type: 'document',
                html_content: '<p>test</p>',
                documents: { file_name: 'test.docx' }
            })

        mockSupabase.storage.upload.mockRejectedValue(new Error('Storage Crash'))

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'docx' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('Storage Crash')
    })

    it('should handle signed URL generation failures', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue({
                id: 'v1',
                user_id: mockUser.id,
                version_number: 1,
                original_file_type: 'document',
                html_content: '<p>test</p>',
                documents: { file_name: 'test.docx' }
            })

        mockSupabase.storage.upload.mockResolvedValue({ error: null })
        mockSupabase.storage.createSignedUrl.mockResolvedValue({ error: { message: 'Signed URL Error' } })

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'docx' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('Failed to generate download URL')
    })

    it('should process mega-HTML content with all tags and styles', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

        const megaHtml = `
            <div>
                <h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>
                <br />
                <ol><li>Ordered</li></ol>
                <p style="font-size: 14pt; font-family: 'Times New Roman'; color: rgb(0,128,0)">
                    <u>Underline</u> and <s>strikethrough</s> and <strike>strike tag</strike>
                    <b>Bold tag</b> <i>Italic tag</i>
                </p>
                <div style="text-align: right">Right aligned</div>
                <div style="text-align: justify">Justified</div>
                <p>Mixed <strong>Strong</strong> and <em>Emphasis</em></p>
            </div>
        `
        const mockVersion = {
            id: 'v1',
            user_id: mockUser.id,
            version_number: 1,
            original_file_type: 'document',
            html_content: megaHtml,
            documents: { file_name: 'mega.docx', file_type: 'document' }
        }
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(mockVersion)

        mockSupabase.storage.upload.mockResolvedValue({ error: null })
        mockSupabase.storage.createSignedUrl.mockResolvedValue({ data: { signedUrl: 'link' } })

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'docx' })
        }), params)

        expect(response.status).toBe(200)
    })

    it('should handle empty content in PDF export', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

        const mockVersion = {
            id: 'v1',
            user_id: mockUser.id,
            version_number: 1,
            original_file_type: 'pdf',
            pdf_text_content: '   ', // Only whitespace
            documents: { file_name: 'empty.pdf', file_type: 'pdf' }
        }
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(mockVersion)

        mockSupabase.storage.upload.mockResolvedValue({ error: null })
        mockSupabase.storage.createSignedUrl.mockResolvedValue({ data: { signedUrl: 'link' } })

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'pdf' })
        }), params)

        expect(response.status).toBe(200)
    })
    it('should handle PDF creation failures', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue({
                id: 'v1',
                user_id: mockUser.id,
                original_file_type: 'pdf',
                pdf_text_content: 'test',
                documents: { file_name: 'test.pdf' }
            })

        const { PDFDocument } = require('pdf-lib')
            ; (PDFDocument.create as jest.Mock).mockRejectedValue(new Error('PDF Crash'))

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'pdf' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('PDF Crash')
    })

    it('should return 400 for invalid export format for PDF type', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue({
                id: 'v1',
                user_id: mockUser.id,
                original_file_type: 'pdf',
                pdf_text_content: 'test',
                documents: { file_name: 'test.pdf' }
            })

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'docx' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('Invalid export format for PDF document')
    })

    it('should return 400 for version with no editable content', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue({
                id: 'v1',
                user_id: mockUser.id,
                original_file_type: 'unknown',
                documents: { file_name: 'test.unknown' }
            })

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'docx' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('No editable content found')
    })

    it('should handle global catch block on database update failure', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue({
                id: 'v1',
                user_id: mockUser.id,
                version_number: 1,
                original_file_type: 'document',
                html_content: '<p>test</p>',
                documents: { file_name: 'test.docx' }
            })

        mockSupabase.storage.upload.mockResolvedValue({ error: null })
            ; (prisma.user_document_versions.update as jest.Mock).mockRejectedValue(new Error('Update DB Error'))

        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ version_id: 'v1', export_format: 'docx' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('Update DB Error')
    })
})
