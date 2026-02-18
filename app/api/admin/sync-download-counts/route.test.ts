import { POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/utils/roles'
import { createMockRequest, validateResponse } from '@/test/utils/handler-utils'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

jest.mock('@/lib/prisma', () => ({
    prisma: {
        documents: {
            findMany: jest.fn(),
            update: jest.fn()
        },
        download_logs: {
            count: jest.fn()
        }
    }
}))

jest.mock('@/lib/utils/roles', () => ({
    isAdmin: jest.fn()
}))

describe('Sync Download Counts API', () => {
    const mockUser = { id: 'admin-123' }
    const mockSupabase = {
        auth: {
            getUser: jest.fn()
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => { })
            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should return 401 if not authenticated', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
        const response = await POST()
        const { status, error } = await validateResponse(response)
        expect(status).toBe(401)
        expect(error).toBe('Unauthorized')
    })

    it('should return 403 if not an admin', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (isAdmin as jest.Mock).mockResolvedValue(false)
        const response = await POST()
        const { status, error } = await validateResponse(response)
        expect(status).toBe(403)
        expect(error).toBe('Forbidden')
    })

    it('should sync download counts for all documents successfully', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (isAdmin as jest.Mock).mockResolvedValue(true)

        const mockDocs = [{ id: 'doc-1' }, { id: 'doc-2' }]
            ; (prisma.documents.findMany as jest.Mock).mockResolvedValue(mockDocs)
            ; (prisma.download_logs.count as jest.Mock)
                .mockResolvedValueOnce(5) // doc-1
                .mockResolvedValueOnce(10) // doc-2

        const response = await POST()
        const { status, data } = await validateResponse(response) as { status: number, data: any }

        expect(status).toBe(200)
        expect(data.synced).toBe(2)
        expect(data.total).toBe(2)
        expect(prisma.documents.update).toHaveBeenCalledTimes(2)
        expect(prisma.documents.update).toHaveBeenCalledWith({
            where: { id: 'doc-1' },
            data: { download_count: 5 }
        })
    })

    it('should handle individual document sync failures', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (isAdmin as jest.Mock).mockResolvedValue(true)

        const mockDocs = [{ id: 'doc-1' }, { id: 'doc-fail' }]
            ; (prisma.documents.findMany as jest.Mock).mockResolvedValue(mockDocs)
            ; (prisma.download_logs.count as jest.Mock)
                .mockResolvedValueOnce(5)
                .mockRejectedValueOnce(new Error('Individual error'))

        const response = await POST()
        const { status, data } = await validateResponse(response) as { status: number, data: any }

        expect(status).toBe(200)
        expect(data.synced).toBe(1)
        expect(data.errors).toHaveLength(1)
        expect(data.errors[0]).toContain('Failed to sync document doc-fail: Individual error')
    })

    it('should handle global database errors', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
            ; (isAdmin as jest.Mock).mockResolvedValue(true)
            ; (prisma.documents.findMany as jest.Mock).mockRejectedValue(new Error('Global DB error'))

        const response = await POST()
        const { status, error } = await validateResponse(response)

        expect(status).toBe(500)
        expect(error).toBe('Global DB error')
    })
})
