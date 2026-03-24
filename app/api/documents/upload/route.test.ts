import { POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/utils/roles'
import { ERROR_MESSAGES, STORAGE_BUCKETS } from '@/constants'
import { DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { validateResponse, cleanupMocks } from '@/test/utils/handler-utils'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/prisma', () => ({
    prisma: (require('jest-mock-extended') as any).mockDeep(),
}))
jest.mock('@/lib/utils/roles')

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Document Upload API', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000'
    const mockUser = { id: mockUserId, email: 'user@example.com' }

    // Helper to create a multi-part form data request
    const createUploadRequest = (fields: Record<string, any>, files: { content: string, name: string, type: string }[] = [{ content: 'test data', name: 'test.pdf', type: 'application/pdf' }]) => {
        const formData = new FormData()
        
        if (fields.file === null) {
            // skip adding files
        } else {
            files.forEach(f => {
                const blob = new Blob([f.content], { type: f.type })
                formData.append('file', blob, f.name)
            })
        }

        Object.entries(fields).forEach(([key, value]) => {
            if (key !== 'file' && value !== undefined) {
                formData.append(key, value)
            }
        })

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

        it('should upload a single document successfully', async () => {
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
            expect(prismaMock.documents.create).toHaveBeenCalled()
        })

        it('should upload multiple documents successfully (bulk)', async () => {
            prismaMock.documents.create.mockResolvedValue({
                id: 'new-id',
                file_size: BigInt(9),
            } as any)

            const files = [
                { content: 'data1', name: 'doc1.pdf', type: 'application/pdf' },
                { content: 'data2', name: 'doc2.pdf', type: 'application/pdf' }
            ]

            const request = createUploadRequest(validFields, files)
            const response = await POST(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(201)
            expect(Array.isArray(data)).toBe(true)
            expect(data.length).toBe(2)
            expect(prismaMock.documents.create).toHaveBeenCalledTimes(2)
        })

        it('should detect various file types correctly', async () => {
            const types = [
                { name: 'test.doc', type: 'document' },
                { name: 'test.xls', type: 'spreadsheet' },
                { name: 'test.pdf', type: 'pdf' },
                { name: 'test.unknown', type: 'other' }
            ]

            for (const t of types) {
                prismaMock.documents.create.mockResolvedValueOnce({ id: 'id', file_size: BigInt(1) } as any)
                const request = createUploadRequest(validFields, [{ content: 'c', name: t.name, type: 'any' }])
                await POST(request)
                expect(prismaMock.documents.create).toHaveBeenLastCalledWith(expect.objectContaining({
                    data: expect.objectContaining({
                        file_type: t.type
                    })
                }))
            }
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
})
