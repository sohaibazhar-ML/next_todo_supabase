import { GET, PATCH, DELETE } from './route'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/utils/roles'
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

describe('Subadmin Detail API', () => {
    const mockAdminId = 'admin-123'
    const mockAdmin = { id: mockAdminId, email: 'admin@example.com' }
    const mockUserId = 'user-456'
    const mockSubadminProfile = {
        id: mockUserId,
        username: 'subuser',
        email: 'sub@test.com',
        role: 'subadmin',
        subadmin_permissions: {
            can_upload_documents: true,
            can_view_stats: false,
            is_active: true
        }
    }

    beforeEach(() => {
        ; (createClient as jest.Mock).mockResolvedValue({
            auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockAdmin } }) }
        })
            ; (requireAdmin as jest.Mock).mockResolvedValue(undefined)

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

            const request = createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`)
            const response = await GET(request, { params: Promise.resolve({ userId: mockUserId }) })
            const { status, error } = await validateResponse<any>(response)
            expect(status).toBe(401)
            expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
        })

        it('should return 403 if requireAdmin fails with custom message in GET', async () => {
            ; (requireAdmin as jest.Mock).mockRejectedValue(new Error('Admin access required'))
            const response = await GET(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(403)
        })

        it('should handle generic error in GET catch', async () => {
            prismaMock.profiles.findUnique.mockRejectedValue('Simple error')
            const response = await GET(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(500)
        })

        it('should return 404 if user not found', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(null)
            const response = await GET(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            const { status, error } = await validateResponse<any>(response)
            expect(status).toBe(404)
            expect(error).toBe(ERROR_MESSAGES.USER_NOT_FOUND)
        })

        it('should return 400 if user is not a subadmin', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ ...mockSubadminProfile, role: 'user' } as any)
            const response = await GET(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            const { status, error } = await validateResponse<any>(response)
            expect(status).toBe(400)
            expect(error).toBe(ERROR_MESSAGES.USER_NOT_SUBADMIN)
        })

        it('should return subadmin details on success', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(mockSubadminProfile as any)
            const response = await GET(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            const { status, data } = await validateResponse<any>(response)
            expect(status).toBe(200)
            expect(data.id).toBe(mockUserId)
            expect(data.permissions.can_upload_documents).toBe(true)
        })

        it('should return default permissions if subadmin_permissions is null in GET', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ ...mockSubadminProfile, subadmin_permissions: null } as any)
            const response = await GET(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            const { status, data } = await validateResponse<any>(response)
            expect(status).toBe(200)
            expect(data.permissions.is_active).toBe(false)
        })
    })

    describe('PATCH Handler', () => {
        it('should return 404 if user not found', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(null)
            const response = await PATCH(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'PATCH', body: '{}' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(404)
        })

        it('should return 401 if user is not authenticated in PATCH', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
            })
            const response = await PATCH(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'PATCH' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(401)
        })

        it('should return 400 if user is not subadmin', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ role: 'user' } as any)
            const response = await PATCH(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'PATCH', body: '{}' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(400)
        })

        it('should update specific permissions and return updated profile', async () => {
            prismaMock.profiles.findUnique
                .mockResolvedValueOnce(mockSubadminProfile as any) // Check role
                .mockResolvedValueOnce({ ...mockSubadminProfile, subadmin_permissions: { ...mockSubadminProfile.subadmin_permissions, can_view_stats: true } } as any) // Return update

            prismaMock.subadmin_permissions.update.mockResolvedValue({} as any)

            const request = createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, {
                method: 'PATCH',
                body: JSON.stringify({ can_upload_documents: true, can_view_stats: true, is_active: false })
            })
            const response = await PATCH(request, { params: Promise.resolve({ userId: mockUserId }) })
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(prismaMock.subadmin_permissions.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { user_id: mockUserId },
                data: expect.objectContaining({
                    can_upload_documents: true,
                    can_view_stats: true,
                    is_active: false
                })
            }))
        })

        it('should return 404 if updatedProfile is not found (race condition)', async () => {
            prismaMock.profiles.findUnique
                .mockResolvedValueOnce(mockSubadminProfile as any) // role check
                .mockResolvedValueOnce(null) // fetch update

            const response = await PATCH(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'PATCH', body: '{}' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(404)
        })

        it('should handle Prisma P2025 error (permissions record not found)', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(mockSubadminProfile as any)
            const p2025 = new Error('Record not found')
                ; (p2025 as any).code = 'P2025'
            prismaMock.subadmin_permissions.update.mockRejectedValue(p2025)

            const response = await PATCH(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'PATCH', body: '{}' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            const { status, error } = await validateResponse<any>(response)
            expect(status).toBe(404)
            expect(error).toBe(ERROR_MESSAGES.SUBADMIN_PERMISSIONS_NOT_FOUND)
        })

        it('should handle generic error with custom message in catch', async () => {
            prismaMock.profiles.findUnique.mockRejectedValue({ message: 'Patch fail' })
            const response = await PATCH(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'PATCH', body: '{}' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(500)
        })

        it('should return default permissions if updatedProfile permissions is null', async () => {
            prismaMock.profiles.findUnique
                .mockResolvedValueOnce(mockSubadminProfile as any) // role check
                .mockResolvedValueOnce({ ...mockSubadminProfile, subadmin_permissions: null } as any) // fetch updated

            prismaMock.subadmin_permissions.update.mockResolvedValue({} as any)

            const response = await PATCH(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'PATCH', body: '{}' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            const { data } = await validateResponse<any>(response)
            expect(data.permissions.can_upload_documents).toBe(false)
        })

        it('should handle PATCH generic error without message in catch', async () => {
            prismaMock.profiles.findUnique.mockRejectedValue('Generic message')
            const response = await PATCH(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'PATCH', body: '{}' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(500)
        })

        it('should handle requireAdmin rejection with custom message in PATCH', async () => {
            ; (requireAdmin as jest.Mock).mockRejectedValue(new Error('Admin access required'))
            const response = await PATCH(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'PATCH', body: '{}' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(403)
        })
    })

    describe('DELETE Handler', () => {
        it('should return 404 if user not found', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(null)
            const response = await DELETE(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'DELETE' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(404)
        })

        it('should return 401 if user is not authenticated in DELETE', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
            })
            const response = await DELETE(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'DELETE' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(401)
        })

        it('should return 400 if user is not subadmin', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ role: 'user' } as any)
            const response = await DELETE(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'DELETE' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(400)
        })

        it('should successfully remove subadmin role and permissions', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(mockSubadminProfile as any)
            prismaMock.subadmin_permissions.deleteMany.mockResolvedValue({ count: 1 } as any)
            prismaMock.profiles.update.mockResolvedValue({} as any)

            const response = await DELETE(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'DELETE' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.message).toContain('removed')
            expect(prismaMock.profiles.update).toHaveBeenCalledWith({
                where: { id: mockUserId },
                data: { role: 'user' }
            })
        })

        it('should handle errors in catch block', async () => {
            prismaMock.profiles.findUnique.mockRejectedValue(new Error('Delete error'))
            const response = await DELETE(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'DELETE' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(500)
        })

        it('should handle DELETE generic error without message in catch', async () => {
            prismaMock.profiles.findUnique.mockRejectedValue('Generic error')
            const response = await DELETE(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'DELETE' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(500)
        })

        it('should handle requireAdmin rejection with custom message in DELETE', async () => {
            ; (requireAdmin as jest.Mock).mockRejectedValue(new Error('Admin access required'))
            const response = await DELETE(
                createMockRequest(`http://localhost/api/admin/subadmins/${mockUserId}`, { method: 'DELETE' }),
                { params: Promise.resolve({ userId: mockUserId }) }
            )
            expect(response.status).toBe(403)
        })
    })
})
