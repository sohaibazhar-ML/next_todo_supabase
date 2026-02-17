import { GET, POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/utils/roles'
import { ERROR_MESSAGES } from '@/constants'
import { DeepMockProxy } from 'jest-mock-extended'
import { PrismaClient } from '@prisma/client'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/lib/prisma', () => ({
    prisma: (require('jest-mock-extended') as any).mockDeep(),
}))
jest.mock('@/lib/utils/roles')

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Documents API', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000'
    const mockUser = { id: mockUserId, email: 'user@example.com' }

    const mockDocuments = [
        {
            id: 'doc-1',
            title: 'Technical Specification',
            category: 'technical',
            file_type: 'pdf',
            is_featured: true,
            is_active: true,
            tags: ['docs', 'important'],
            created_at: new Date('2024-01-01T10:00:00Z'),
            file_size: BigInt(1024),
            parent_document_id: null,
            download_count: 5
        },
        {
            id: 'doc-2',
            title: 'User Manual',
            category: 'manual',
            file_type: 'docx',
            is_featured: false,
            is_active: true,
            tags: ['help'],
            created_at: new Date('2024-02-01T10:00:00Z'),
            file_size: BigInt(2048),
            parent_document_id: null,
            download_count: 10
        }
    ]

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { })
        jest.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    describe('GET Handler', () => {
        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
            })

            const request = createMockRequest('http://localhost/api/documents')
            const response = await GET(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(401)
            expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
        })

        it('should return 200 and list root documents by default (parent_document_id is null)', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockResolvedValue(mockDocuments as any)

            const request = createMockRequest('http://localhost/api/documents')
            const response = await GET(request)
            const { status, data } = await validateResponse<any[]>(response)

            expect(status).toBe(200)
            expect(Array.isArray(data)).toBe(true)
            expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    parent_document_id: null
                })
            }))
            // Verify BigInt serialization
            expect(typeof data![0].file_size).toBe('number')
        })

        it('should hit serialization branch when file_size is already a number', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockResolvedValue([
                { ...mockDocuments[0], file_size: 1024 }
            ] as any)

            const request = createMockRequest('http://localhost/api/documents')
            const response = await GET(request)
            const { status } = await validateResponse<any[]>(response)
            expect(status).toBe(200)
        })

        it('should filter by category and fileType', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockResolvedValue([])

            const request = createMockRequest('http://localhost/api/documents?category=technical&fileType=pdf')
            await GET(request)

            expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    category: 'technical',
                    file_type: 'pdf'
                })
            }))
        })

        it('should filter by featuredOnly=true', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockResolvedValue([])

            const request = createMockRequest('http://localhost/api/documents?featuredOnly=true')
            await GET(request)

            expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    is_featured: true
                })
            }))
        })

        it('should filter by featuredOnly=false', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockResolvedValue([])

            const request = createMockRequest('http://localhost/api/documents?featuredOnly=false')
            await GET(request)

            expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.not.objectContaining({
                    is_featured: true
                })
            }))
        })

        it('should filter by fromDate only', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockResolvedValue([])

            const fromStr = '2024-01-01'
            const request = createMockRequest(`http://localhost/api/documents?fromDate=${fromStr}`)
            await GET(request)

            expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    created_at: {
                        gte: new Date(fromStr)
                    }
                })
            }))
        })

        it('should filter by toDate only with end-of-day precision', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockResolvedValue([])

            const toStr = '2024-01-31'
            const request = createMockRequest(`http://localhost/api/documents?toDate=${toStr}`)
            await GET(request)

            const expectedEnd = new Date(toStr)
            expectedEnd.setHours(23, 59, 59, 999)

            expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    created_at: {
                        lte: expectedEnd
                    }
                })
            }))
        })

        it('should filter by date range with end-of-day precision', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockResolvedValue([])

            const fromStr = '2024-01-01'
            const toStr = '2024-01-31'
            const request = createMockRequest(`http://localhost/api/documents?fromDate=${fromStr}&toDate=${toStr}`)
            await GET(request)

            const expectedEnd = new Date(toStr)
            expectedEnd.setHours(23, 59, 59, 999)

            expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    created_at: {
                        gte: new Date(fromStr),
                        lte: expectedEnd
                    }
                })
            }))
        })

        it('should apply client-side tag filtering and handle documents without tags', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            const docsWithOneNoTags = [
                ...mockDocuments,
                { id: 'doc-3', title: 'No Tags', tags: null, parent_document_id: null }
            ]
            prismaMock.documents.findMany.mockResolvedValue(docsWithOneNoTags as any)

            const request = createMockRequest('http://localhost/api/documents?tags=important')
            const response = await GET(request)
            const { status, data } = await validateResponse<any[]>(response)

            expect(status).toBe(200)
            expect(data).toHaveLength(1)
        })

        it('should apply all sorting options including fallback', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockResolvedValue([])

            const sortOptions = [
                'created_at_asc',
                'created_at_desc',
                'title_asc',
                'title_desc',
                'download_count_asc',
                'download_count_desc',
                'invalid_sort'
            ]

            for (const sort of sortOptions) {
                const request = createMockRequest(`http://localhost/api/documents?sort=${sort}`)
                await GET(request)

                let expectedOrderBy: any = { created_at: 'desc' }
                if (sort === 'created_at_asc') expectedOrderBy = { created_at: 'asc' }
                if (sort === 'created_at_desc') expectedOrderBy = { created_at: 'desc' }
                if (sort === 'title_asc') expectedOrderBy = { title: 'asc' }
                if (sort === 'title_desc') expectedOrderBy = { title: 'desc' }
                if (sort === 'download_count_asc') expectedOrderBy = { download_count: 'asc' }
                if (sort === 'download_count_desc') expectedOrderBy = { download_count: 'desc' }

                expect(prismaMock.documents.findMany).toHaveBeenLastCalledWith(expect.objectContaining({
                    orderBy: expectedOrderBy
                }))
            }
        })

        describe('Search Functionality', () => {
            it('should use $queryRawUnsafe for search and return ranked results', async () => {
                ; (createClient as jest.Mock).mockResolvedValue({
                    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
                })

                const searchResults = [
                    { id: 'doc-2', rank: 0.9 },
                    { id: 'doc-1', rank: 0.5 }
                ]
                prismaMock.$queryRawUnsafe.mockResolvedValue(searchResults)
                prismaMock.documents.findMany.mockResolvedValue(mockDocuments as any)

                const request = createMockRequest('http://localhost/api/documents?searchQuery=technical')
                const response = await GET(request)
                const { status, data } = await validateResponse<any[]>(response)

                expect(status).toBe(200)
                expect(data![0].id).toBe('doc-2')
            })

            it('should hit serialization branch when search doc file_size is already a number', async () => {
                ; (createClient as jest.Mock).mockResolvedValue({
                    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
                })
                prismaMock.$queryRawUnsafe.mockResolvedValue([{ id: 'doc-1' }])
                prismaMock.documents.findMany.mockResolvedValue([
                    { ...mockDocuments[0], file_size: 1024 }
                ] as any)

                const request = createMockRequest('http://localhost/api/documents?searchQuery=technical')
                const response = await GET(request)
                const { status } = await validateResponse<any[]>(response)
                expect(status).toBe(200)
            })

            it('should use fallback rank when rank is missing from search results', async () => {
                ; (createClient as jest.Mock).mockResolvedValue({
                    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
                })
                prismaMock.$queryRawUnsafe.mockResolvedValue([{ id: 'doc-1' }])
                prismaMock.documents.findMany.mockResolvedValue([mockDocuments[0]] as any)

                const request = createMockRequest('http://localhost/api/documents?searchQuery=technical')
                const response = await GET(request)
                const { status, data } = await validateResponse<any[]>(response)

                expect(status).toBe(200)
                // _rank is stripped during serialization in L144
                expect(data![0]._rank).toBeUndefined()
            })

            it('should use $queryRawUnsafe with null filters for category and fileType', async () => {
                ; (createClient as jest.Mock).mockResolvedValue({
                    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
                })
                prismaMock.$queryRawUnsafe.mockResolvedValue([])

                const request = createMockRequest('http://localhost/api/documents?searchQuery=test')
                await GET(request)

                expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
                    expect.any(String),
                    'test',
                    null,
                    null,
                    100,
                    0
                )
            })

            it('should verify fromDate only in search fetch', async () => {
                ; (createClient as jest.Mock).mockResolvedValue({
                    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
                })
                prismaMock.$queryRawUnsafe.mockResolvedValue([{ id: 'doc-1' }])
                prismaMock.documents.findMany.mockResolvedValue([mockDocuments[0]] as any)

                const fromDateStr = '2024-01-01'
                const requestWithFromDate = createMockRequest(`http://localhost/api/documents?searchQuery=test&fromDate=${fromDateStr}`)
                await GET(requestWithFromDate)

                expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                    where: expect.objectContaining({
                        created_at: {
                            gte: new Date(fromDateStr)
                        }
                    })
                }))
            })

            it('should verify toDate only in search fetch', async () => {
                ; (createClient as jest.Mock).mockResolvedValue({
                    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
                })
                prismaMock.$queryRawUnsafe.mockResolvedValue([{ id: 'doc-1' }])
                prismaMock.documents.findMany.mockResolvedValue([mockDocuments[0]] as any)

                const toDateStr = '2024-12-31'
                const requestWithToDate = createMockRequest(`http://localhost/api/documents?searchQuery=test&toDate=${toDateStr}`)
                await GET(requestWithToDate)

                const expectedToDate = new Date(toDateStr)
                expectedToDate.setHours(23, 59, 59, 999)

                expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                    where: expect.objectContaining({
                        created_at: {
                            lte: expectedToDate
                        }
                    })
                }))
            })

            it('should apply tag filtering and handle null tags in search results', async () => {
                ; (createClient as jest.Mock).mockResolvedValue({
                    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
                })
                prismaMock.$queryRawUnsafe.mockResolvedValue([{ id: 'doc-1' }, { id: 'doc-3' }])
                prismaMock.documents.findMany.mockResolvedValue([
                    ...mockDocuments,
                    { id: 'doc-3', title: 'No Tags', tags: null }
                ] as any)

                const request = createMockRequest('http://localhost/api/documents?searchQuery=test&tags=important')
                const response = await GET(request)
                const { status, data } = await validateResponse<any[]>(response)

                expect(status).toBe(200)
                expect(data).toHaveLength(1)
            })

            it('should return empty array if search returns no results', async () => {
                ; (createClient as jest.Mock).mockResolvedValue({
                    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
                })
                prismaMock.$queryRawUnsafe.mockResolvedValue([])

                const request = createMockRequest('http://localhost/api/documents?searchQuery=nonexistent')
                const response = await GET(request)
                const { status, data } = await validateResponse<any[]>(response)

                expect(status).toBe(200)
                expect(data).toEqual([])
            })
        })

        it('should return 500 if prisma throws a non-Error object', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockRejectedValue('String Error')

            const request = createMockRequest('http://localhost/api/documents')
            const response = await GET(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(500)
        })

        it('should return 500 if prisma throws a standard Error', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.documents.findMany.mockRejectedValue(new Error('DB Panic'))

            const request = createMockRequest('http://localhost/api/documents')
            const response = await GET(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(500)
        })
    })

    describe('POST Handler', () => {
        const validDocBody = {
            title: 'New Document',
            description: 'A test document',
            category: 'misc',
            tags: ['new'],
            file_name: 'test.pdf',
            file_path: '/path/to/test.pdf',
            file_size: 512,
            file_type: 'pdf',
            mime_type: 'application/pdf',
            version: '1.0'
        }

        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
            })

            const request = createMockRequest('http://localhost/api/documents', {
                method: 'POST',
                body: JSON.stringify(validDocBody)
            })
            const response = await POST(request)
            const { status } = await validateResponse<any>(response)
            expect(status).toBe(401)
        })

        it('should return 403 if user is not an admin', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)

            const request = createMockRequest('http://localhost/api/documents', {
                method: 'POST',
                body: JSON.stringify(validDocBody)
            })
            const response = await POST(request)
            const { status } = await validateResponse<any>(response)
            expect(status).toBe(403)
        })

        it('should create document with all optional fields provided', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)

            const fullBody = {
                title: 'Full Doc',
                description: 'Full description',
                category: 'tech',
                tags: ['a', 'b'],
                file_name: 'full.pdf',
                file_path: '/full.pdf',
                file_size: 1024,
                file_type: 'pdf',
                mime_type: 'application/pdf',
                version: '2.0',
                is_featured: true,
                is_active: false,
                searchable_content: 'some text',
                parent_document_id: 'parent-123'
            }

            prismaMock.documents.create.mockResolvedValue({
                ...fullBody,
                id: 'new-id',
                file_size: BigInt(1024),
                created_by: mockUserId,
                created_at: new Date()
            } as any)

            const request = createMockRequest('http://localhost/api/documents', {
                method: 'POST',
                body: JSON.stringify(fullBody)
            })
            const response = await POST(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(201)
            expect(prismaMock.documents.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    is_featured: true,
                    is_active: false,
                    searchable_content: 'some text',
                    parent_document_id: 'parent-123'
                })
            }))
        })

        it('should create document with default values for optional fields', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)

            const minimalBody = {
                title: 'Minimal Doc',
                category: 'misc',
                file_name: 'test.pdf',
                file_path: '/path.pdf',
                file_size: 512,
                file_type: 'pdf',
                mime_type: 'application/pdf'
            }

            prismaMock.documents.create.mockResolvedValue({
                ...minimalBody,
                id: 'new-id',
                description: null,
                tags: [],
                version: '1.0',
                file_size: BigInt(512),
                created_by: mockUserId,
                created_at: new Date()
            } as any)

            const request = createMockRequest('http://localhost/api/documents', {
                method: 'POST',
                body: JSON.stringify(minimalBody)
            })
            const response = await POST(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(201)
            expect(data.version).toBe('1.0')
            expect(Array.isArray(data.tags)).toBe(true)
        })

        it('should return 500 if prisma throws on POST', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.documents.create.mockRejectedValue('POST Failure')

            const request = createMockRequest('http://localhost/api/documents', {
                method: 'POST',
                body: JSON.stringify(validDocBody)
            })
            const response = await POST(request)
            const { status } = await validateResponse<any>(response)
            expect(status).toBe(500)
        })

        it('should return 500 if prisma throws Error object on POST', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.documents.create.mockRejectedValue(new Error('POST Error Object'))

            const request = createMockRequest('http://localhost/api/documents', {
                method: 'POST',
                body: JSON.stringify(validDocBody)
            })
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)
            expect(status).toBe(500)
            expect(error).toBe('POST Error Object')
        })
    })
})
