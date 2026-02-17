import { GET } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { ERROR_MESSAGES, STORAGE_BUCKETS } from '@/constants'
import { DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'
import mammoth from 'mammoth'
import { PDFDocument } from 'pdf-lib'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/prisma', () => ({
    prisma: (require('jest-mock-extended') as any).mockDeep(),
}))
jest.mock('mammoth')
jest.mock('pdf-lib', () => ({
    PDFDocument: {
        load: jest.fn()
    }
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Document Conversion API', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000'
    const mockUser = { id: mockUserId, email: 'user@example.com' }
    const docId = 'doc-123'

    const mockDocument = {
        id: docId,
        file_path: 'user-1/test.docx',
        file_type: 'document',
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        file_name: 'test.docx'
    }

    const mockStorage = {
        from: jest.fn().mockReturnThis(),
        download: jest.fn().mockResolvedValue({ data: { arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }, error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'http://signed-url' }, error: null })
    }

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { })
        jest.spyOn(console, 'error').mockImplementation(() => { })
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) },
                storage: mockStorage
            })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should return 401 if user is not authenticated', async () => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
        })

        const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
        const response = await GET(request, { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(401)
        expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
    })

    it('should return 404 if document is not found', async () => {
        prismaMock.documents.findUnique.mockResolvedValue(null)

        const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
        const response = await GET(request, { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(404)
        expect(error).toBe(ERROR_MESSAGES.DOCUMENT_NOT_FOUND)
    })

    it('should return 500 if storage download fails', async () => {
        prismaMock.documents.findUnique.mockResolvedValue(mockDocument as any)
        mockStorage.download.mockResolvedValueOnce({ error: { message: 'Download failure' } })

        const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
        const response = await GET(request, { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(500)
        expect(error).toContain('Failed to download document: Download failure')
    })

    it('should return 404 if file is missing in storage', async () => {
        prismaMock.documents.findUnique.mockResolvedValue(mockDocument as any)
        mockStorage.download.mockResolvedValueOnce({ data: null, error: null })

        const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
        const response = await GET(request, { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(404)
        expect(error).toBe(ERROR_MESSAGES.FILE_NOT_FOUND_IN_STORAGE)
    })

    describe('DOCX Conversion', () => {
        it('should convert DOCX to HTML successfully', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(mockDocument as any)
                ; (mammoth.convertToHtml as jest.Mock).mockResolvedValue({ value: '<p>test</p>', messages: [] })

            const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
            const response = await GET(request, { params: Promise.resolve({ id: docId }) })
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.type).toBe('docx')
            expect(data.content).toBe('<p>test</p>')
        })

        it('should handle legacy .doc format errors', async () => {
            prismaMock.documents.findUnique.mockResolvedValue({ ...mockDocument, file_name: 'old.doc' } as any)

            const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
            const response = await GET(request, { params: Promise.resolve({ id: docId }) })
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(400)
            expect(error).toBe(ERROR_MESSAGES.LEGACY_DOC_FORMAT_NOT_SUPPORTED)
        })

        it('should fallback to arrayBuffer if buffer conversion fails', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(mockDocument as any)
                ; (mammoth.convertToHtml as jest.Mock)
                    .mockRejectedValueOnce(new Error('Buffer failed'))
                    .mockResolvedValueOnce({ value: '<p>fallback success</p>', messages: [] })

            const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
            const response = await GET(request, { params: Promise.resolve({ id: docId }) })
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.content).toBe('<p>fallback success</p>')
            expect(mammoth.convertToHtml).toHaveBeenCalledTimes(2)
        })

        it('should return 500 if both conversion attempts fail (non-Error)', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(mockDocument as any)
                ; (mammoth.convertToHtml as jest.Mock).mockRejectedValue('Mammoth Crash')

            const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
            const response = await GET(request, { params: Promise.resolve({ id: docId }) })
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(500)
            expect(error).toContain(ERROR_MESSAGES.CONVERT_DOCUMENT_FAILED)
        })

        it('should return 500 if both conversion attempts fail', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(mockDocument as any)
                ; (mammoth.convertToHtml as jest.Mock).mockRejectedValue(new Error('Total failure'))

            const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
            const response = await GET(request, { params: Promise.resolve({ id: docId }) })
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(500)
            expect(error).toContain('Total failure')
        })
    })

    describe('PDF Processing', () => {
        const pdfDoc = {
            id: docId,
            file_path: 'user-1/test.pdf',
            file_type: 'pdf',
            mime_type: 'application/pdf',
            file_name: 'test.pdf'
        }

        it('should process PDF and return signed URL and page count', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(pdfDoc as any)
                ; (PDFDocument.load as jest.Mock).mockResolvedValue({
                    getPages: () => ({ length: 5 })
                })

            const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
            const response = await GET(request, { params: Promise.resolve({ id: docId }) })
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.type).toBe('pdf')
            expect(data.pageCount).toBe(5)
            expect(data.pdfUrl).toBe('http://signed-url')
        })

        it('should handle missing signed URL data gracefully', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(pdfDoc as any)
                ; (PDFDocument.load as jest.Mock).mockResolvedValue({
                    getPages: () => ({ length: 1 })
                })
            mockStorage.createSignedUrl.mockResolvedValueOnce({ data: null, error: null })

            const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
            const response = await GET(request, { params: Promise.resolve({ id: docId }) })
            const { data } = await validateResponse<any>(response)

            expect(data.pdfUrl).toBeNull()
        })

        it('should return 500 if PDF processing throws a non-Error object', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(pdfDoc as any)
                ; (PDFDocument.load as jest.Mock).mockRejectedValue('PDF Exploded')

            const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
            const response = await GET(request, { params: Promise.resolve({ id: docId }) })
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(500)
            expect(error).toContain(ERROR_MESSAGES.PDF_PROCESSING_FAILED)
        })

        it('should return 500 if PDF processing fails', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(pdfDoc as any)
                ; (PDFDocument.load as jest.Mock).mockRejectedValue(new Error('PDF Parse Error'))

            const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
            const response = await GET(request, { params: Promise.resolve({ id: docId }) })
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(500)
            expect(error).toContain('PDF Parse Error')
        })

        it('should return 500 if signed URL generation fails', async () => {
            prismaMock.documents.findUnique.mockResolvedValue(pdfDoc as any)
                ; (PDFDocument.load as jest.Mock).mockResolvedValue({
                    getPages: () => ({ length: 1 })
                })
            mockStorage.createSignedUrl.mockResolvedValueOnce({ error: { message: 'URL Error' } })

            const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
            const response = await GET(request, { params: Promise.resolve({ id: docId }) })
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(500)
            expect(error).toContain('Failed to generate PDF URL: URL Error')
        })
    })

    it('should return 400 for unsupported file types', async () => {
        prismaMock.documents.findUnique.mockResolvedValue({ ...mockDocument, file_type: 'image', mime_type: 'image/jpeg', file_name: 'test.jpg' } as any)

        const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
        const response = await GET(request, { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(400)
        expect(error).toBe(ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE)
    })

    it('should return 400 for documents with no identified type', async () => {
        prismaMock.documents.findUnique.mockResolvedValue({ ...mockDocument, file_type: 'other', mime_type: 'application/octet-stream', file_name: 'no-ext' } as any)

        const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
        const response = await GET(request, { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(400)
        expect(error).toBe(ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE)
    })

    it('should return 500 if an unexpected error occurs (non-Error)', async () => {
        prismaMock.documents.findUnique.mockRejectedValue('Global explode')

        const request = createMockRequest(`http://localhost/api/documents/${docId}/convert`)
        const response = await GET(request, { params: Promise.resolve({ id: docId }) })
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(500)
        expect(error).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    })
})
