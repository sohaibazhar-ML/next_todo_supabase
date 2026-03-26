import { GET } from './route'
import { prismaMock } from '@/lib/__mocks__/prisma'
import { createMockRequest, validateResponse, cleanupMocks } from '@/test/utils/handler-utils'
import { createSupabaseMock, setupSupabaseMock } from '@/test/utils/supabase-mock'
import { startOfMonth, endOfMonth, format } from 'date-fns'

// Mock dependencies
jest.mock('@/lib/supabase/server')
jest.mock('@/utils/roles')

describe('Reports API — GET /api/admin/reports', () => {
    const mockUserId = 'user-123'
    const mockUser = { id: mockUserId, email: 'admin@example.com' }
    
    const setupAuth = (isAdmin = true, isSubadmin = false) => {
        const { getUserPermissions } = require('@/utils/roles')
        setupSupabaseMock(createSupabaseMock({ user: mockUser }))
        getUserPermissions.mockResolvedValue({ 
            isAdmin, 
            isSubadmin,
            role: isAdmin ? 'admin' : (isSubadmin ? 'subadmin' : 'user')
        })
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
    })

    afterEach(() => {
        cleanupMocks()
        jest.restoreAllMocks()
    })

    it('should return 401 if unauthorized', async () => {
        setupSupabaseMock(createSupabaseMock({ user: null }))
        const response = await GET(createMockRequest('http://local'))
        expect(response.status).toBe(401)
    })

    it('should return 403 if not admin or subadmin', async () => {
        setupAuth(false, false)
        const response = await GET(createMockRequest('http://local'))
        expect(response.status).toBe(403)
    })

    it('should use database-side aggregation for report data', async () => {
        setupAuth(true)
        const now = new Date()
        const dayStr = format(now, 'yyyy-MM-dd')
        
        prismaMock.documents.count.mockResolvedValue(10)
        prismaMock.download_logs.count.mockResolvedValue(5)
        
        // Mock groupBy results
        ;(prismaMock.documents as any).groupBy = jest.fn().mockResolvedValue([
            { created_at: now, _count: 10 }
        ])
        ;(prismaMock.download_logs as any).groupBy = jest.fn().mockResolvedValue([
            { downloaded_at: now, _count: 5 }
        ])

        const response = await GET(createMockRequest('http://local'))
        const { status, data } = await validateResponse<any>(response)

        expect(status).toBe(200)
        expect(data.totalUploads).toBe(10)
        expect(data.totalDownloads).toBe(5)
        
        const todayData = data.dailyData.find((d: any) => d.date === dayStr)
        expect(todayData.uploads).toBe(10)
        expect(todayData.downloads).toBe(5)

        expect(prismaMock.documents.count).toHaveBeenCalled()
        expect((prismaMock.documents as any).groupBy).toHaveBeenCalledWith(expect.objectContaining({
            by: ['created_at']
        }))
    })

    it('should return 400 for invalid date format', async () => {
        setupAuth(true)
        const response = await GET(createMockRequest(`http://local?from=garbage&to=2024-01-01`))
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toBe('Invalid date format')
    })
})
