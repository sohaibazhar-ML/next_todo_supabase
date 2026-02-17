import { GET, POST } from './route'
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

describe('Subadmins API', () => {
    const mockAdminId = 'admin-123'
    const mockAdmin = { id: mockAdminId, email: 'admin@example.com' }
    const mockUserId = 'user-456'

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

            const request = createMockRequest('http://localhost/api/admin/subadmins')
            const response = await GET(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(401)
            expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
        })

        it('should return 403 if requireAdmin fails', async () => {
            ; (requireAdmin as jest.Mock).mockRejectedValue(new Error('Admin access required'))

            const request = createMockRequest('http://localhost/api/admin/subadmins')
            const response = await GET(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(403)
        })

        it('should return list of subadmins with mapped permissions', async () => {
            const mockSubadmin = {
                id: 'sub-1',
                username: 'sub1',
                email: 'sub1@test.com',
                first_name: 'Sub',
                last_name: 'One',
                role: 'subadmin',
                created_at: new Date(),
                updated_at: new Date(),
                subadmin_permissions: {
                    can_upload_documents: true,
                    can_view_stats: false,
                    is_active: true
                }
            }
            prismaMock.profiles.findMany.mockResolvedValue([mockSubadmin] as any)

            const request = createMockRequest('http://localhost/api/admin/subadmins')
            const response = await GET(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data).toHaveLength(1)
            expect(data[0].permissions.can_upload_documents).toBe(true)
            expect(data[0].username).toBe('sub1')
        })

        it('should provide default permissions if entry is missing', async () => {
            const mockSubadminNoPerms = {
                id: 'sub-2',
                role: 'subadmin',
                subadmin_permissions: null
            }
            prismaMock.profiles.findMany.mockResolvedValue([mockSubadminNoPerms] as any)

            const response = await GET(createMockRequest('http://localhost/api/admin/subadmins'))
            const { data } = await validateResponse<any>(response)

            expect(data[0].permissions.is_active).toBe(false)
        })

        it('should return 500 on generic prisma error', async () => {
            prismaMock.profiles.findMany.mockRejectedValue(new Error('DB Fail'))
            const response = await GET(createMockRequest('http://localhost/api/admin/subadmins'))
            expect(response.status).toBe(500)
        })

        it('should handle generic non-object error in GET catch', async () => {
            prismaMock.profiles.findMany.mockRejectedValue('Simple string error')
            const response = await GET(createMockRequest('http://localhost/api/admin/subadmins'))
            expect(response.status).toBe(500)
        })

        it('should handle requireAdmin rejection with custom message', async () => {
            ; (requireAdmin as jest.Mock).mockRejectedValue(new Error('Some other error'))
            const response = await GET(createMockRequest('http://localhost/api/admin/subadmins'))
            const { status } = await validateResponse<any>(response)
            expect(status).toBe(500)
        })
    })

    describe('POST Handler', () => {
        const validBody = {
            userId: mockUserId,
            can_upload_documents: true,
            can_view_stats: true,
            is_active: true
        }

        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
            })

            const request = createMockRequest('http://localhost/api/admin/subadmins', { method: 'POST' })
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(401)
            expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
        })

        it('should return 400 if userId is missing', async () => {
            const request = createMockRequest('http://localhost/api/admin/subadmins', {
                method: 'POST',
                body: JSON.stringify({ can_view_stats: true })
            })
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(400)
            expect(error).toBe(ERROR_MESSAGES.USER_ID_REQUIRED)
        })

        it('should return 404 if target user does not exist', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(null)

            const request = createMockRequest('http://localhost/api/admin/subadmins', {
                method: 'POST',
                body: JSON.stringify(validBody)
            })
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(404)
            expect(error).toBe(ERROR_MESSAGES.USER_NOT_FOUND)
        })

        it('should return 400 if trying to assign subadmin to an admin', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ id: mockUserId, role: 'admin' } as any)

            const request = createMockRequest('http://localhost/api/admin/subadmins', {
                method: 'POST',
                body: JSON.stringify(validBody)
            })
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(400)
            expect(error).toBe(ERROR_MESSAGES.CANNOT_ASSIGN_SUBADMIN_TO_ADMIN)
        })

        it('should successfully update role and upsert permissions', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ id: mockUserId, role: 'user' } as any)
            prismaMock.profiles.update.mockResolvedValue({} as any)
            prismaMock.subadmin_permissions.upsert.mockResolvedValue({ user_id: mockUserId } as any)

            const request = createMockRequest('http://localhost/api/admin/subadmins', {
                method: 'POST',
                body: JSON.stringify(validBody)
            })
            const response = await POST(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.message).toContain('successfully')
            expect(prismaMock.profiles.update).toHaveBeenCalledWith({
                where: { id: mockUserId },
                data: { role: 'subadmin' }
            })
            expect(prismaMock.subadmin_permissions.upsert).toHaveBeenCalledWith(expect.objectContaining({
                where: { user_id: mockUserId },
                create: expect.objectContaining({ can_upload_documents: true }),
                update: expect.objectContaining({ can_upload_documents: true })
            }))
        })

        it('should use default values for permissions if not provided in body', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ id: mockUserId, role: 'user' } as any)

            const request = createMockRequest('http://localhost/api/admin/subadmins', {
                method: 'POST',
                body: JSON.stringify({ userId: mockUserId })
            })
            await POST(request)

            expect(prismaMock.subadmin_permissions.upsert).toHaveBeenCalledWith(expect.objectContaining({
                create: expect.objectContaining({
                    can_upload_documents: false,
                    can_view_stats: false,
                    is_active: true
                })
            }))
        })

        it('should return 500 and handle non-Error objects in catch', async () => {
            prismaMock.profiles.findUnique.mockRejectedValue('String Error')
            const request = createMockRequest('http://localhost/api/admin/subadmins', {
                method: 'POST',
                body: JSON.stringify(validBody)
            })
            const response = await POST(request)
            expect(response.status).toBe(500)
        })

        it('should return 403 if requireAdmin fails in POST', async () => {
            ; (requireAdmin as jest.Mock).mockRejectedValue(new Error('Admin access required'))
            const request = createMockRequest('http://localhost/api/admin/subadmins', {
                method: 'POST',
                body: JSON.stringify(validBody)
            })
            const response = await POST(request)
            expect(response.status).toBe(403)
        })
    })
})
