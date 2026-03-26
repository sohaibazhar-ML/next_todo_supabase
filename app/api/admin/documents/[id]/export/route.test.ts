import { POST } from './route'
import { prismaMock } from '@/lib/__mocks__/prisma'
import { ERROR_MESSAGES } from '@/constants'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'
import { createSupabaseMock, setupSupabaseMock } from '@/test/utils/supabase-mock'
import { Packer } from 'docx'
import { PDFDocument } from 'pdf-lib'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/utils/roles')

// Mock docx and pdf-lib to avoid actual generation overhead during tests
jest.mock('docx', () => ({
    Document: jest.fn(),
    Packer: { toBuffer: jest.fn() },
    Paragraph: jest.fn().mockImplementation((opts) => opts),
    TextRun: jest.fn().mockImplementation((opts) => opts),
    HeadingLevel: {
        HEADING_1: 'h1', HEADING_2: 'h2', HEADING_3: 'h3',
        HEADING_4: 'h4', HEADING_5: 'h5', HEADING_6: 'h6',
    },
    AlignmentType: { CENTER: 'center', RIGHT: 'right', JUSTIFIED: 'justify', LEFT: 'left' },
    UnderlineType: { SINGLE: 'single' }
}))

jest.mock('pdf-lib', () => ({
    PDFDocument: { create: jest.fn() },
    rgb: jest.fn(),
    StandardFonts: { Helvetica: 'Helvetica' }
}))

describe('Document Export API — POST /api/admin/documents/[id]/export', () => {
    const mockUserId = 'user-123'
    const mockUser = { id: mockUserId, email: 'test@example.com' }
    const docId = 'doc-123'
    const params = Promise.resolve({ id: docId })

    const makeVersion = (overrides = {}) => ({
        id: 'v1',
        user_id: mockUserId,
        version_number: 1,
        original_file_type: 'document',
        html_content: '<p>Hello</p>',
        pdf_text_content: null,
        documents: { file_name: 'report.docx', file_type: 'document' },
        ...overrides
    })

    const postBody = (overrides = {}) => JSON.stringify({ version_id: 'v1', export_format: 'docx', ...overrides })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
        ;(Packer.toBuffer as jest.Mock).mockResolvedValue(Buffer.from('docx-bytes'))
        ;(PDFDocument.create as jest.Mock).mockResolvedValue({
            embedFont: jest.fn().mockResolvedValue({
                widthOfTextAtSize: jest.fn().mockReturnValue(10)
            }),
            addPage: jest.fn().mockReturnValue({ drawText: jest.fn() }),
            save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
        })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should return 401 if not authenticated', async () => {
        setupSupabaseMock(createSupabaseMock({ user: null }))
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), { params })
        expect(response.status).toBe(401)
    })

    it('should return 400 if version_id is missing', async () => {
        setupSupabaseMock(createSupabaseMock({ user: mockUser }))
        const response = await POST(createMockRequest('http://local', {
            method: 'POST',
            body: JSON.stringify({ export_format: 'docx' })
        }), { params })
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toBe(ERROR_MESSAGES.VERSION_ID_REQUIRED)
    })

    it('should return 404 if version does not exist', async () => {
        setupSupabaseMock(createSupabaseMock({ user: mockUser }))
        prismaMock.user_document_versions.findUnique.mockResolvedValue(null)
        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), { params })
        const { status, error } = await validateResponse(response)
        expect(status).toBe(404)
        expect(error).toBe(ERROR_MESSAGES.VERSION_NOT_FOUND)
    })

    it('should export DOCX successfully', async () => {
        const supabaseMock = createSupabaseMock({ user: mockUser })
        setupSupabaseMock(supabaseMock)
        prismaMock.user_document_versions.findUnique.mockResolvedValue(makeVersion() as any)
        prismaMock.user_document_versions.update.mockResolvedValue({} as any)

        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), { params })
        const { status, data } = await validateResponse<any>(response)

        expect(status).toBe(200)
        expect(data.signedUrl).toBe('http://local/signed-url')
        expect(prismaMock.user_document_versions.update).toHaveBeenCalled()
    })

    it('should return 500 when storage upload fails', async () => {
        const supabaseMock = createSupabaseMock({ user: mockUser })
        supabaseMock.storage.upload.mockResolvedValue({ error: { message: 'Bucket full' } })
        setupSupabaseMock(supabaseMock)
        prismaMock.user_document_versions.findUnique.mockResolvedValue(makeVersion() as any)

        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), { params })
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toContain('Bucket full')
        expect(error).toContain(ERROR_MESSAGES.STORAGE_UPLOAD_ERROR)
    })

    it('should return 500 when Packer.toBuffer throws', async () => {
        setupSupabaseMock(createSupabaseMock({ user: mockUser }))
        prismaMock.user_document_versions.findUnique.mockResolvedValue(makeVersion() as any)
        ;(Packer.toBuffer as jest.Mock).mockRejectedValue(new Error('Packing failed'))

        const response = await POST(createMockRequest('http://local', { method: 'POST', body: postBody() }), { params })
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toContain('Packing failed')
    })
})
