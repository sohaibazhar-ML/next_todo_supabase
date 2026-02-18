import { POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createMockRequest, validateResponse } from '@/test/utils/handler-utils'
import { Packer } from 'docx'
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

// ─── Shared helpers ────────────────────────────────────────────────────────────

const mockUser = { id: 'user-123', email: 'test@example.com' }
const docId = 'doc-123'
const params = { params: Promise.resolve({ id: docId }) }

function makeSupabase(overrides: Record<string, any> = {}) {
    return {
        auth: { getUser: jest.fn() },
        storage: {
            from: jest.fn().mockReturnThis(),
            upload: jest.fn().mockResolvedValue({ error: null }),
            createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://signed.url/file' } }),
            ...overrides.storage
        },
        ...overrides
    }
}

function makeVersion(overrides: Record<string, any> = {}) {
    return {
        id: 'v1',
        user_id: mockUser.id,
        version_number: 1,
        original_file_type: 'document',
        html_content: '<p>Hello</p>',
        pdf_text_content: null,
        documents: { file_name: 'report.docx', file_type: 'document' },
        ...overrides
    }
}

function postBody(overrides: Record<string, any> = {}) {
    return JSON.stringify({ version_id: 'v1', export_format: 'docx', ...overrides })
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('Document Export API — POST /api/documents/[id]/export', () => {
    let mockSupabase: ReturnType<typeof makeSupabase>

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
        mockSupabase = makeSupabase()
            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
            ; (Packer.toBuffer as jest.Mock).mockResolvedValue(Buffer.from('docx-bytes'))
            ; (PDFDocument.create as jest.Mock).mockResolvedValue({
                embedFont: jest.fn().mockResolvedValue({
                    widthOfTextAtSize: jest.fn().mockReturnValue(10)
                }),
                addPage: jest.fn().mockReturnValue({ drawText: jest.fn() }),
                save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
            })
            ; (prisma.user_document_versions.update as jest.Mock).mockResolvedValue({})
    })

    afterEach(() => jest.restoreAllMocks())

    // ── Auth ──────────────────────────────────────────────────────────────────

    it('should return 401 if not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(401)
    })

    // ── Input validation ──────────────────────────────────────────────────────

    it('should return 400 if version_id is missing', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ export_format: 'docx' }) // no version_id
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('Version ID is required')
    })

    // ── Version lookup ────────────────────────────────────────────────────────

    it('should return 404 if version does not exist (null)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(null)
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(404)
        expect(error).toContain('Version not found')
    })

    it('should return 404 if version belongs to a different user', async () => {
        // Branch: editedVersion.user_id !== user.id
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ user_id: 'other-user-999' }) // different owner
            )
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(404)
        expect(error).toContain('Version not found')
    })

    // ── DOCX export path ──────────────────────────────────────────────────────

    it('should export DOCX successfully and return signedUrl + fileName + filePath', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion())

        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, data } = await validateResponse(response) as { status: number, data: any }

        expect(status).toBe(200)
        expect(data.signedUrl).toBe('https://signed.url/file')
        expect(data.fileName).toMatch(/report_edited_v1\.docx$/)
        expect(data.filePath).toContain('user-edits/user-123/')
        expect(prisma.user_document_versions.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'v1' },
            data: expect.objectContaining({ exported_mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
        }))
    })

    it('should return 400 when trying to export a DOCX version as PDF', async () => {
        // Branch: originalFileType === 'document' && htmlContent, but export_format !== 'docx'
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion())
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: postBody({ export_format: 'pdf' }) // wrong format for docx
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('Invalid export format for DOCX document')
    })

    it('should return 500 when Packer.toBuffer throws a known Error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion())
            ; (Packer.toBuffer as jest.Mock).mockRejectedValue(new Error('DOCX packing failed'))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('DOCX packing failed')
    })


    // ── HTML content with various tags (covers htmlToDocx branches) ───────────

    it('should handle DOCX export with rich HTML: all heading levels h1-h6', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with <br> tags (empty paragraph branch)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<p>Before</p><br /><p>After</p>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with unordered lists', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<ul><li>Item A</li><li>Item B</li></ul>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with ordered lists', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<ol><li>First</li><li>Second</li></ol>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with inline formatting: bold, italic, underline, strikethrough', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<p><strong>Bold</strong> <em>Italic</em> <u>Underline</u> <s>Strike</s> <b>B</b> <i>I</i> <strike>old</strike></p>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with inline CSS: color (hex), font-size (pt), font-family', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<p style="color: #FF5733; font-size: 14pt; font-family: \'Arial\', sans-serif">Styled text</p>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with inline CSS: color (rgb), font-size (px)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<p style="color: rgb(255, 0, 0); font-size: 16px">RGB color and px size</p>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with named CSS colors (red, blue, green, etc.)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<p style="color: red">Red</p><p style="color: blue">Blue</p><p style="color: unknowncolor">Unknown</p>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with text-align styles (center, right, justify)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = `
            <p style="text-align: center">Centered</p>
            <p style="text-align: right">Right</p>
            <p style="text-align: justify">Justified</p>
            <p style="text-align: left">Left</p>
        `
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with HTML entities in content', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<p>&amp; &lt; &gt; &quot; &#39; &apos; &nbsp; &copy; &reg; &trade; &hellip; &mdash; &ndash; &#65; &#x41;</p>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with empty HTML (falls back to "Empty document")', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '   ' // whitespace only — htmlToDocx returns fallback paragraph
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with bare text nodes (not wrapped in tags)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        // Text node directly in body — hits the node.type === 'text' branch in htmlToDocx
        const html = 'Just plain text without any tags'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with rgba() color format', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<p style="color: rgba(0, 128, 255, 0.5)">RGBA color</p>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with font-size in plain number (no unit — assumes pt)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
        const html = '<p style="font-size: 18">No unit size</p>'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion({ html_content: html }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        expect(response.status).toBe(200)
    })

    it('should handle DOCX export with document type=document but html_content is null (falls to else/no-content)', async () => {
        // Branch: originalFileType === 'document' but htmlContent is null → falls to else block → 400
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ original_file_type: 'document', html_content: null })
            )
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('No editable content found')
    })

    // ── PDF export path ───────────────────────────────────────────────────────

    it('should export PDF successfully and return signedUrl + fileName + filePath', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ original_file_type: 'pdf', html_content: null, pdf_text_content: 'Line 1\nLine 2' })
            )
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: postBody({ export_format: 'pdf' })
        }), params)
        const { status, data } = await validateResponse(response) as { status: number, data: any }
        expect(status).toBe(200)
        expect(data.signedUrl).toBe('https://signed.url/file')
        expect(data.fileName).toMatch(/report_edited_v1\.pdf$/)
        expect(prisma.user_document_versions.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ exported_mime_type: 'application/pdf' })
        }))
    })

    it('should return 400 when trying to export a PDF version as DOCX', async () => {
        // Branch: originalFileType === 'pdf' && pdfTextContent, but export_format !== 'pdf'
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ original_file_type: 'pdf', html_content: null, pdf_text_content: 'Some text' })
            )
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: postBody({ export_format: 'docx' }) // wrong format for pdf
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('Invalid export format for PDF document')
    })

    it('should handle PDF export with empty/whitespace-only content (draws "No content to export")', async () => {
        // Branch: lines.every(line => !line.trim()) → drawText('No content to export')
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ original_file_type: 'pdf', html_content: null, pdf_text_content: '   \n  \n  ' })
            )
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: postBody({ export_format: 'pdf' })
        }), params)
        expect(response.status).toBe(200)
    })

    it('should handle PDF export with long lines that trigger word-wrap', async () => {
        // Branch: textWidth > maxWidth && currentLine → wraps to next line
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

        // Make widthOfTextAtSize return a large value to trigger wrapping
        const mockFont = { widthOfTextAtSize: jest.fn().mockReturnValue(999) }
        const mockPage = { drawText: jest.fn() }
            ; (PDFDocument.create as jest.Mock).mockResolvedValue({
                embedFont: jest.fn().mockResolvedValue(mockFont),
                addPage: jest.fn().mockReturnValue(mockPage),
                save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
            })

        const longLine = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10'
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ original_file_type: 'pdf', html_content: null, pdf_text_content: longLine })
            )
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: postBody({ export_format: 'pdf' })
        }), params)
        expect(response.status).toBe(200)
    })

    it('should handle PDF export with many lines that trigger page breaks', async () => {
        // Branch: y < margin → pdfDoc.addPage() called
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

        let pageCount = 0
        const mockPage = { drawText: jest.fn() }
            ; (PDFDocument.create as jest.Mock).mockResolvedValue({
                embedFont: jest.fn().mockResolvedValue({ widthOfTextAtSize: jest.fn().mockReturnValue(10) }),
                addPage: jest.fn().mockImplementation(() => { pageCount++; return mockPage }),
                save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
            })

        // 100 lines will exhaust the page height (792px / 14.4px lineHeight ≈ 55 lines per page)
        const manyLines = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`).join('\n')
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ original_file_type: 'pdf', html_content: null, pdf_text_content: manyLines })
            )
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: postBody({ export_format: 'pdf' })
        }), params)
        expect(response.status).toBe(200)
        // Should have added at least one extra page
        expect(pageCount).toBeGreaterThan(1)
    })

    it('should handle PDF export with an empty line (currentLine is empty → y -= lineHeight)', async () => {
        // Branch: currentLine is empty after processing a line → else branch y -= lineHeight
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ original_file_type: 'pdf', html_content: null, pdf_text_content: 'Line 1\n\nLine 3' })
            )
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: postBody({ export_format: 'pdf' })
        }), params)
        expect(response.status).toBe(200)
    })

    it('should return 500 when PDFDocument.create throws a known Error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ original_file_type: 'pdf', html_content: null, pdf_text_content: 'text' })
            )
            ; (PDFDocument.create as jest.Mock).mockRejectedValue(new Error('PDF engine crash'))
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: postBody({ export_format: 'pdf' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('PDF engine crash')
    })


    it('should return 400 for version with type=pdf but pdf_text_content is null (no editable content)', async () => {
        // Branch: originalFileType === 'pdf' but pdfTextContent is null → falls to else
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ original_file_type: 'pdf', html_content: null, pdf_text_content: null })
            )
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: postBody({ export_format: 'pdf' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('No editable content found')
    })

    it('should return 400 for version with unknown original_file_type', async () => {
        // Branch: else block — neither document nor pdf
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(
                makeVersion({ original_file_type: 'google', html_content: null, pdf_text_content: null })
            )
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: postBody({ export_format: 'docx' })
        }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toContain('No editable content found')
    })

    // ── Storage upload ────────────────────────────────────────────────────────

    it('should return 500 when storage upload returns an error object', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion())
        mockSupabase.storage.upload.mockResolvedValue({ error: { message: 'Bucket full' } })
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('Bucket full')
    })

    it('should return 500 when storage upload throws a known Error (exception path)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion())
        mockSupabase.storage.upload.mockRejectedValue(new Error('Network timeout'))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('Network timeout')
    })

    it('should return 500 with generic message when storage upload throws a non-Error', async () => {
        // Branch: isErrorWithMessage(uploadErr) === false
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion())
        mockSupabase.storage.upload.mockRejectedValue({ code: 'ECONNREFUSED' }) // non-Error object
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('Storage upload error')
    })

    // ── Signed URL ────────────────────────────────────────────────────────────

    it('should return 500 when createSignedUrl returns an error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion())
        mockSupabase.storage.createSignedUrl.mockResolvedValue({ error: { message: 'URL error' }, data: null })
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('Failed to generate download URL')
    })

    it('should return 500 when createSignedUrl returns null data (no error, no data)', async () => {
        // Branch: !urlData (data is null/undefined even without error)
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion())
        mockSupabase.storage.createSignedUrl.mockResolvedValue({ error: null, data: null })
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('Failed to generate download URL')
    })

    // ── Database update after export ──────────────────────────────────────────

    it('should return 500 when prisma.update throws (outer catch block)', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion())
            ; (prisma.user_document_versions.update as jest.Mock).mockRejectedValue(new Error('DB write failed'))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toContain('DB write failed')
    })

    it('should return 500 with generic message when outer catch receives a non-Error', async () => {
        // Branch: isErrorWithMessage(error) === false in outer catch
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (prisma.user_document_versions.findUnique as jest.Mock).mockResolvedValue(makeVersion())
            ; (prisma.user_document_versions.update as jest.Mock).mockRejectedValue(undefined)
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), params)
        const { status, error } = await validateResponse(response)
        expect(status).toBe(500)
        expect(error).toBe('Internal server error')
    })
})
