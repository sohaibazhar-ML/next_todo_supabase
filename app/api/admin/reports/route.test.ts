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
        const { isAdmin: isAdminFn, isSubadmin: isSubadminFn } = require('@/utils/roles')
        setupSupabaseMock(createSupabaseMock({ user: mockUser }))
        isAdminFn.mockResolvedValue(isAdmin)
        isSubadminFn.mockResolvedValue(isSubadmin)
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

    it('should return report for current month by default', async () => {
        setupAuth(true)
        const now = new Date()
        const start = startOfMonth(now)
        const end = endOfMonth(now)
        
        prismaMock.documents.findMany.mockResolvedValue([
            { created_at: now }
        ] as any)
        prismaMock.download_logs.findMany.mockResolvedValue([
            { downloaded_at: now }
        ] as any)

        const response = await GET(createMockRequest('http://local'))
        const { status, data } = await validateResponse<any>(response)

        expect(status).toBe(200)
        expect(data.from).toBe(format(start, 'yyyy-MM-dd'))
        expect(data.to).toBe(format(end, 'yyyy-MM-dd'))
        expect(data.totalUploads).toBe(1)
        expect(data.totalDownloads).toBe(1)
        
        // At least one dailyData entry should reflect the counts
        const dayStr = format(now, 'yyyy-MM-dd')
        const todayData = data.dailyData.find((d: any) => d.date === dayStr)
        expect(todayData.uploads).toBe(1)
        expect(todayData.downloads).toBe(1)
    })

    it('should return report for custom date range', async () => {
        setupAuth(true)
        const from = '2024-01-01'
        const to = '2024-01-05'
        
        prismaMock.documents.findMany.mockResolvedValue([])
        prismaMock.download_logs.findMany.mockResolvedValue([])

        const response = await GET(createMockRequest(`http://local?from=${from}&to=${to}`))
        const { status, data } = await validateResponse<any>(response)

        expect(status).toBe(200)
        expect(data.from).toBe(from)
        expect(data.to).toBe(to)
        expect(data.data).toHaveLength(5) // (1st to 5th = 5 days)

        expect(prismaMock.documents.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                created_at: {
                    gte: new Date(from),
                    lte: expect.any(Date)
                }
            }
        }))
        
        // Verify precision
        const capturedLte = (prismaMock.documents.findMany.mock.calls[0][0] as any).where.created_at.lte
        expect(capturedLte.getHours()).toBe(23)
        expect(capturedLte.getMinutes()).toBe(59)
    })

    it('should return 400 for invalid date format', async () => {
        setupAuth(true)
        const response = await GET(createMockRequest(`http://local?from=garbage&to=2024-01-01`))
        const { status, error } = await validateResponse(response)
        expect(status).toBe(400)
        expect(error).toBe('Invalid date format')
    })
})
