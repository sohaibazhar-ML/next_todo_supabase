import { GET } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/utils/roles'
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

describe('Admin Stats API', () => {
    const mockUserId = 'admin-123'
    const mockUser = { id: mockUserId, email: 'admin@example.com' }

    beforeEach(() => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
        })
            ; (hasPermission as jest.Mock).mockResolvedValue(true)

        jest.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should return 401 if user is not authenticated', async () => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
        })

        const request = createMockRequest('http://localhost/api/admin/stats')
        const response = await GET(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(401)
        expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
    })

    it('should return 403 if user lacks can_view_stats permission', async () => {
        ; (hasPermission as jest.Mock).mockResolvedValue(false)

        const request = createMockRequest('http://localhost/api/admin/stats')
        const response = await GET(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(403)
        expect(error).toBe(ERROR_MESSAGES.PERMISSION_REQUIRED_VIEW_STATS)
    })

    describe('Filtering and Aggregation', () => {
        beforeEach(() => {
            // Default mocks for all Prisma calls to prevent 500s
            prismaMock.profiles.count.mockResolvedValue(0)
            prismaMock.documents.count.mockResolvedValue(0)
            prismaMock.download_logs.groupBy.mockResolvedValue([])
            prismaMock.user_document_versions.groupBy.mockResolvedValue([])
            prismaMock.documents.findMany.mockResolvedValue([])
            prismaMock.profiles.findMany.mockResolvedValue([])
            prismaMock.download_logs.findMany.mockResolvedValue([])
            prismaMock.user_document_versions.findMany.mockResolvedValue([])
        })

        it('should handle basic request with no filters', async () => {
            prismaMock.profiles.count.mockResolvedValue(10)

            // Mock sequence for findMany calls in order of execution:
            // 1. documentsWithLogs (line 148)
            // 2. allNonAdminUsers (line 234)
            // 3. categories (line 348)
            // 4. allTags (line 358)
            prismaMock.documents.findMany
                .mockResolvedValueOnce([]) // documentsWithLogs
                .mockResolvedValueOnce([{ category: 'Finance' }] as any) // categories
                .mockResolvedValueOnce([{ tags: ['tax'] }] as any) // allTags

            prismaMock.profiles.findMany.mockResolvedValueOnce([]) // allNonAdminUsers

            const request = createMockRequest('http://localhost/api/admin/stats')
            const response = await GET(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.summary.totalUsers).toBe(10)
            expect(data.filterOptions.categories).toContain('Finance')
            expect(data.filterOptions.tags).toContain('tax')
        })

        it('should hit toDate normalization IIFEs in all queries', async () => {
            const request = createMockRequest('http://localhost/api/admin/stats?toDate=2023-01-31')
            const response = await GET(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(prismaMock.user_document_versions.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    updated_at: expect.objectContaining({
                        lte: expect.any(Date)
                    })
                })
            }))
        })

        it('should apply date filters correctly', async () => {
            const request = createMockRequest('http://localhost/api/admin/stats?fromDate=2023-01-01&toDate=2023-01-31')
            const response = await GET(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(prismaMock.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    downloaded_at: expect.objectContaining({
                        gte: new Date('2023-01-01'),
                        lte: expect.any(Date)
                    })
                })
            }))

            const lteDate = (prismaMock.download_logs.findMany.mock.calls[0][0] as any).where.downloaded_at.lte
            expect(lteDate.getHours()).toBe(23)
        })

        it('should handle search filter and use found user IDs', async () => {
            // Sequence for findMany:
            // 1. filteredUsers (line 110)
            // 2. documentsWithLogs (line 148)
            // 3. allNonAdminUsers (line 234)
            // 4. downloadUserProfiles (line 318)
            prismaMock.profiles.findMany
                .mockResolvedValueOnce([{ id: 'user-found' }] as any) // filteredUsers
                .mockResolvedValueOnce([{ id: 'user-found' }] as any) // allNonAdminUsers
                .mockResolvedValueOnce([{ id: 'user-found', email: 'b@b.com' }] as any) // downloadUserProfiles

            const request = createMockRequest('http://localhost/api/admin/stats?search=bob')
            const response = await GET(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(prismaMock.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    user_id: { in: ['user-found'] }
                })
            }))
        })

        it('should handle search filter and early exit if no matches', async () => {
            prismaMock.profiles.findMany.mockResolvedValueOnce([]) // No users found for search
            prismaMock.documents.count.mockResolvedValueOnce(0) // No matching documents for search

            const request = createMockRequest('http://localhost/api/admin/stats?search=nonexistent')
            const response = await GET(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.summary.totalUsers).toBe(0)
        })

        it('should proceed if search matches document but no users', async () => {
            prismaMock.profiles.count.mockResolvedValue(10)

            // Mock sequence:
            // 1. documents.count (line 103) -> totalDocuments
            // 2. profiles.findMany (line 110) -> search match
            // 3. documents.count (line 117) -> matchingDocsCount (search)
            prismaMock.documents.count
                .mockResolvedValueOnce(100) // totalDocuments
                .mockResolvedValueOnce(1)   // matchingDocsCount (search)

            prismaMock.profiles.findMany
                .mockResolvedValueOnce([]) // search match (none)
                .mockResolvedValueOnce([{ id: 'admin-1', email: 'a@a.com' }] as any) // allNonAdminUsers (line 241)
                .mockResolvedValueOnce([]) // downloadUserProfiles (line 325)

            prismaMock.documents.findMany.mockResolvedValueOnce([]) // documentsWithLogs (line 154)

            const request = createMockRequest('http://localhost/api/admin/stats?search=doc-match')
            const response = await GET(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.summary.totalDocuments).toBe(100)
            expect(prismaMock.download_logs.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    user_id: { in: [] }
                })
            }))
        })

        it('should filter by category and tags', async () => {
            const request = createMockRequest('http://localhost/api/admin/stats?category=Finance&tags=urgent,test')
            await GET(request)

            expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    category: 'Finance',
                    tags: { hasSome: ['urgent', 'test'] }
                })
            }))
        })

        it('should aggregate data successfully with results', async () => {
            // Mock document counts map
            prismaMock.download_logs.groupBy.mockResolvedValueOnce([{ document_id: 'doc-1', _count: { id: 5 } }] as any)

            // Mock documents with logs (two items for sort coverage)
            prismaMock.documents.findMany.mockResolvedValueOnce([
                {
                    id: 'doc-1', title: 'Doc 1', file_name: 'test.docx', category: 'General', download_logs: [{ id: 'log-1', user_id: 'user-1', downloaded_at: new Date() }]
                },
                {
                    id: 'doc-2', title: 'Doc 2', file_name: 'test2.docx', category: 'General', download_logs: []
                }
            ] as any)

            // Mock user versions count
            prismaMock.profiles.findMany.mockResolvedValueOnce([{ id: 'user-1', first_name: 'Bob', last_name: 'Builder', email: 'bob@example.com' }] as any)
            prismaMock.user_document_versions.groupBy.mockResolvedValueOnce([{ user_id: 'user-1', _count: { id: 3 } }] as any)

            // Mock download logs with profiles
            prismaMock.download_logs.findMany.mockResolvedValueOnce([
                { id: 'log-1', user_id: 'user-1', document_id: 'doc-1', downloaded_at: new Date(), documents: { title: 'Doc 1', file_name: 'test.docx', category: 'General' } }
            ] as any)
            prismaMock.profiles.findMany.mockResolvedValueOnce([{ id: 'user-1', first_name: 'Bob', last_name: 'Builder', email: 'bob@example.com' }] as any)

            // Mock versions with data
            prismaMock.user_document_versions.findMany.mockResolvedValueOnce([
                {
                    id: 'v-1', version_number: 1, exported_file_size: BigInt(1024),
                    documents: { id: 'doc-1', title: 'Doc 1', file_name: 'test.docx' }
                }
            ] as any)

            const request = createMockRequest('http://localhost/api/admin/stats')
            const response = await GET(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.downloadsPerDocument[0].total_downloads).toBe(5)
            expect(data.userVersionsCount[0].versions_count).toBe(3)
            expect(data.versionDownloads[0].exported_file_size).toBe("1024")
            expect(data.userDocumentDownloads[0].user_name).toBe('Bob Builder')
        })
    })

    it('should return 500 if an error occurs during stats retrieval', async () => {
        prismaMock.profiles.count.mockRejectedValue(new Error('Stats Crash'))

        const request = createMockRequest('http://localhost/api/admin/stats')
        const response = await GET(request)
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(500)
        expect(error).toBe('Stats Crash')
        expect(console.error).toHaveBeenCalled()
    })
})
