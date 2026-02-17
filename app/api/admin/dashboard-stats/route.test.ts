import { GET } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { isAdmin, isSubadmin } from '@/lib/utils/roles'
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

describe('Dashboard Stats API', () => {
    const mockUserId = 'admin-123'
    const mockUser = { id: mockUserId, email: 'admin@example.com' }

    beforeEach(() => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
        })
            ; (isAdmin as jest.Mock).mockResolvedValue(true)
            ; (isSubadmin as jest.Mock).mockResolvedValue(false)

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

        const request = createMockRequest('http://localhost/api/admin/dashboard-stats')
        const response = await GET()
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(401)
        expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
    })

    it('should return 403 if user is neither admin nor subadmin', async () => {
        ; (isAdmin as jest.Mock).mockResolvedValue(false)
            ; (isSubadmin as jest.Mock).mockResolvedValue(false)

        const response = await GET()
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(403)
        expect(error).toBe(ERROR_MESSAGES.FORBIDDEN)
    })

    it('should return 200 with statistics for admin', async () => {
        // Mock all counts
        prismaMock.documents.count.mockResolvedValue(100)
        prismaMock.profiles.count.mockResolvedValue(50)
        prismaMock.subadmin_permissions.count.mockResolvedValue(5)
        prismaMock.download_logs.count.mockResolvedValue(200)

        // Mock recent documents with variety
        prismaMock.documents.findMany.mockResolvedValue([
            { id: 'doc-1', title: 'Doc 1', category: 'Cat A', download_count: 60, created_at: new Date(), created_by: 'user-1' },
            { id: 'doc-2', title: 'Doc 2', category: 'Cat B', download_count: 50, created_at: new Date(), created_by: 'user-2' },
            { id: 'doc-3', title: 'Doc 3', category: 'Cat C', download_count: 21, created_at: new Date(), created_by: null },
            { id: 'doc-4', title: 'Doc 4', category: 'Cat D', download_count: 20, created_at: new Date(), created_by: 'user-not-in-list' },
            { id: 'doc-5', title: 'Doc 5', category: 'Cat E', download_count: 0, created_at: new Date(), created_by: 'user-1' },
            { id: 'doc-6', title: 'Doc 6', category: 'Cat F', download_count: null, created_at: new Date(), created_by: 'user-1' }
        ] as any)

        // Mock creators
        prismaMock.profiles.findMany.mockResolvedValue([
            { id: 'user-1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
            { id: 'user-2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
        ] as any)

        const response = await GET()
        const { status, data } = await validateResponse<any>(response)

        expect(status).toBe(200)
        expect(data.statistics.projects.total).toBe(100)
        expect(data.projects).toHaveLength(6)
        expect(data.projects[0].priority).toBe('High')
        expect(data.projects[1].priority).toBe('Medium') // 50 is not > 50
        expect(data.projects[2].priority).toBe('Medium') // 21 is > 20
        expect(data.projects[3].priority).toBe('Low')    // 20 is not > 20
        expect(data.projects[4].priority).toBe('Low')
        expect(data.projects[5].priority).toBe('Low')
        expect(data.projects[2].members).toHaveLength(0) // created_by is null
        expect(data.projects[3].members).toHaveLength(0) // creator not found in list
    })

    it('should return 200 with statistics for subadmin', async () => {
        ; (isAdmin as jest.Mock).mockResolvedValue(false)
            ; (isSubadmin as jest.Mock).mockResolvedValue(true)

        prismaMock.documents.count.mockResolvedValue(10)
        prismaMock.profiles.count.mockResolvedValue(5)
        prismaMock.subadmin_permissions.count.mockResolvedValue(1)
        prismaMock.download_logs.count.mockResolvedValue(20)
        prismaMock.documents.findMany.mockResolvedValue([])
        prismaMock.profiles.findMany.mockResolvedValue([])

        const response = await GET()
        const { status } = await validateResponse<any>(response)

        expect(status).toBe(200)
    })

    it('should handle zero documents for productivity calculation', async () => {
        prismaMock.documents.count.mockResolvedValue(0)
        prismaMock.profiles.count.mockResolvedValue(0)
        prismaMock.subadmin_permissions.count.mockResolvedValue(0)
        prismaMock.download_logs.count.mockResolvedValue(0)
        prismaMock.documents.findMany.mockResolvedValue([])
        prismaMock.profiles.findMany.mockResolvedValue([])

        const response = await GET()
        const { data } = await validateResponse<any>(response)

        expect(data.statistics.productivity.percentage).toBe(0)
    })

    it('should return 500 if a database error occurs', async () => {
        prismaMock.documents.count.mockRejectedValue(new Error('Internal DB failure'))

        const response = await GET()
        const { status, error } = await validateResponse<any>(response)

        expect(status).toBe(500)
        expect(error).toBe(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
        expect(console.error).toHaveBeenCalled()
    })
})
