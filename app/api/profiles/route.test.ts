import { GET, POST, PUT } from './route'
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

describe('Profiles API', () => {
    const mockUserId = '550e8400-e29b-41d4-a716-446655440000'
    const mockUser = { id: mockUserId, email: 'user@example.com' }
    const mockProfile = {
        id: mockUserId,
        username: 'testuser',
        email: 'user@example.com',
        role: 'user',
        created_at: new Date('2024-01-01T12:00:00Z'),
        updated_at: new Date('2024-01-01T12:00:00Z')
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

    describe('GET Handler', () => {
        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
            })

            const request = createMockRequest('http://localhost/api/profiles')
            const response = await GET(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(401)
            expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
        })

        it('should return 404 if specific userId is provided but profile not found', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.profiles.findUnique.mockResolvedValue(null)

            const request = createMockRequest(`http://localhost/api/profiles?userId=${mockUserId}`)
            const response = await GET(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(404)
            expect(error).toBe(ERROR_MESSAGES.PROFILE_NOT_FOUND)
        })

        it('should return 403 if non-admin attempts to view another user\'s profile', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'other-id' } } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)

            const request = createMockRequest(`http://localhost/api/profiles?userId=${mockUserId}`)
            const response = await GET(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(403)
            expect(error).toBe(ERROR_MESSAGES.FORBIDDEN)
        })

        it('should return 200 for successful specific profile fetch', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)
            prismaMock.profiles.findUnique.mockResolvedValue(mockProfile as any)

            const request = createMockRequest(`http://localhost/api/profiles?userId=${mockUserId}`)
            const response = await GET(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.id).toBe(mockUserId)
        })

        it('should return current user\'s profile for non-admin on generic GET', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)
            prismaMock.profiles.findUnique.mockResolvedValue(mockProfile as any)

            const request = createMockRequest('http://localhost/api/profiles')
            const response = await GET(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.id).toBe(mockUserId)
            expect(prismaMock.profiles.findUnique).toHaveBeenCalledWith({
                where: { id: mockUserId }
            })
        })

        it('should verify date range filtering with end-of-day precision for admin', async () => {
            const adminId = '550e8400-e29b-41d4-a716-446655440001'
                ; (createClient as jest.Mock).mockResolvedValue({
                    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: adminId } } }) }
                })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.profiles.findMany.mockResolvedValue([mockProfile] as any)

            const fromStr = '2024-01-01'
            const toStr = '2024-01-01'
            const request = createMockRequest(`http://localhost/api/profiles?fromDate=${fromStr}&toDate=${toStr}`)
            await GET(request)

            const expectedEnd = new Date(toStr)
            expectedEnd.setHours(23, 59, 59, 999)

            expect(prismaMock.profiles.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    created_at: {
                        gte: new Date(fromStr),
                        lte: expectedEnd
                    }
                })
            }))
        })

        it('should return all profiles for admin with search across multiple fields', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.profiles.findMany.mockResolvedValue([mockProfile] as any)

            const request = createMockRequest('http://localhost/api/profiles?search=alex')
            await GET(request)

            expect(prismaMock.profiles.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        { username: { contains: 'alex', mode: 'insensitive' } },
                        { email: { contains: 'alex', mode: 'insensitive' } },
                        { first_name: { contains: 'alex', mode: 'insensitive' } },
                        { last_name: { contains: 'alex', mode: 'insensitive' } }
                    ])
                })
            }))
        })

        it('should filter by role for admin', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.profiles.findMany.mockResolvedValue([mockProfile] as any)

            const request = createMockRequest('http://localhost/api/profiles?role=admin')
            await GET(request)

            expect(prismaMock.profiles.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    role: 'admin'
                })
            }))
        })

        it('should return 500 if prisma throws on GET', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.profiles.findUnique.mockRejectedValue(new Error('DB Error'))

            const request = createMockRequest(`http://localhost/api/profiles?userId=${mockUserId}`)
            const response = await GET(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(500)
        })
    })

    describe('POST Handler', () => {
        it('should return 400 for missing required fields', async () => {
            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'POST',
                body: JSON.stringify({ username: 'test' })
            })
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(400)
            expect(error).toContain(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS)
        })

        it('should return 400 for invalid UUID format', async () => {
            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'POST',
                body: JSON.stringify({ id: 'invalid-id', username: 'test', email: 'test@test.com' })
            })
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(400)
            expect(error).toBe(ERROR_MESSAGES.INVALID_USER_ID_FORMAT)
        })

        it('should return 400 if ID conflict exists', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(mockProfile as any)

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'POST',
                body: JSON.stringify({ id: mockUserId, username: 'testuser', email: 'user@example.com' })
            })
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(400)
            expect(error).toBe(ERROR_MESSAGES.PROFILE_ALREADY_EXISTS)
        })

        it('should return 400 if username already exists', async () => {
            prismaMock.profiles.findUnique
                .mockResolvedValueOnce(null) // ID doesn't exist
                .mockResolvedValueOnce(mockProfile as any) // Username exists

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'POST',
                body: JSON.stringify({ id: mockUserId, username: 'duplicate', email: 'user@example.com' })
            })
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(400)
            expect(error).toBe(ERROR_MESSAGES.USERNAME_EXISTS)
        })

        it('should log warning if authenticated user ID mismatches creation ID (stale session)', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'different-id' } } }) }
            })
            prismaMock.profiles.findUnique.mockResolvedValue(null)
            prismaMock.profiles.create.mockResolvedValue(mockProfile as any)

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'POST',
                body: JSON.stringify({ id: mockUserId, username: 'testuser', email: 'user@example.com' })
            })
            await POST(request)

            expect(console.warn).toHaveBeenCalled()
        })

        it('should create profile successfully and serialize dates', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
            })
            prismaMock.profiles.findUnique.mockResolvedValue(null)
            prismaMock.profiles.create.mockResolvedValue(mockProfile as any)

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'POST',
                body: JSON.stringify({ id: mockUserId, username: 'testuser', email: 'user@example.com' })
            })
            const response = await POST(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(201)
            expect(typeof data.created_at).toBe('string')
        })

        it('should return 500 if prisma throws on creation', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(null)
            prismaMock.profiles.create.mockRejectedValue(new Error('Prisma Panic'))

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'POST',
                body: JSON.stringify({ id: mockUserId, username: 'testuser', email: 'user@example.com' })
            })
            const response = await POST(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(500)
        })

        it('should return 400 for prisma unique constraint violation (P2002)', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(null)
            const prismaError = new Error('Unique constraint failed')
                ; (prismaError as any).code = 'P2002'
            prismaMock.profiles.create.mockRejectedValue(prismaError)

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'POST',
                body: JSON.stringify({ id: mockUserId, username: 'taken', email: 'taken@test.com' })
            })
            const response = await POST(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(400)
            expect(error).toBe(ERROR_MESSAGES.USERNAME_OR_EMAIL_EXISTS)
        })
    })

    describe('PUT Handler', () => {
        it('should return 401 if user is not authenticated', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) }
            })

            const request = createMockRequest('http://localhost/api/profiles', { method: 'PUT' })
            const response = await PUT(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(401)
            expect(error).toBe(ERROR_MESSAGES.UNAUTHORIZED)
        })

        it('should return 403 if user attempts to update another user\'s profile', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'wrong-id' } } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'PUT',
                body: JSON.stringify({ id: mockUserId, first_name: 'Hacker' })
            })
            const response = await PUT(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(403)
            expect(error).toBe(ERROR_MESSAGES.FORBIDDEN)
        })

        it('should return 404 if profile to update is not found', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)
            prismaMock.profiles.findUnique.mockResolvedValue(null)

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'PUT',
                body: JSON.stringify({ first_name: 'NoBody' })
            })
            const response = await PUT(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(404)
            expect(error).toBe(ERROR_MESSAGES.PROFILE_NOT_FOUND)
        })

        it('should fallback to authenticated userId if body.id is missing', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)
            prismaMock.profiles.findUnique.mockResolvedValue(mockProfile as any)
            prismaMock.profiles.update.mockResolvedValue(mockProfile as any)

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'PUT',
                body: JSON.stringify({ first_name: 'AuthUser' }) // no id in body
            })
            await PUT(request)

            expect(prismaMock.profiles.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: mockUserId }
            }))
        })

        it('should return 403 if non-admin attempts to change roles', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)
            prismaMock.profiles.findUnique.mockResolvedValue(mockProfile as any)

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'PUT',
                body: JSON.stringify({ role: 'admin' })
            })
            const response = await PUT(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(403)
            expect(error).toBe(ERROR_MESSAGES.ONLY_ADMINS_CAN_CHANGE_ROLES)
        })

        it('should allow subadmin role identity check (no change should succeed)', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
            const subadminProfile = { ...mockProfile, role: 'subadmin' }
            prismaMock.profiles.findUnique.mockResolvedValue(subadminProfile as any)
            prismaMock.profiles.update.mockResolvedValue(subadminProfile as any)

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'PUT',
                body: JSON.stringify({ id: mockUserId, role: 'subadmin' }) // same as current
            })
            const response = await PUT(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(200)
        })

        it('should return 400 when admin tries changing to/from subadmin incorrectly', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(true)
            prismaMock.profiles.findUnique.mockResolvedValue(mockProfile as any) // current: user

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'PUT',
                body: JSON.stringify({ id: mockUserId, role: 'subadmin' }) // attempt change
            })
            const response = await PUT(request)
            const { status, error } = await validateResponse<any>(response)

            expect(status).toBe(400)
            expect(error).toBe(ERROR_MESSAGES.CANNOT_CHANGE_SUBADMIN_ROLE)
        })

        it('should update profile successfully and include current address', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
                ; (isAdmin as jest.Mock).mockResolvedValue(false)
            prismaMock.profiles.findUnique.mockResolvedValue(mockProfile as any)
            prismaMock.profiles.update.mockResolvedValue({ ...mockProfile, current_address: 'Swiss St 1' } as any)

            const request = createMockRequest('http://localhost/api/profiles', {
                method: 'PUT',
                body: JSON.stringify({ current_address: 'Swiss St 1' })
            })
            const response = await PUT(request)
            const { status, data } = await validateResponse<any>(response)

            expect(status).toBe(200)
            expect(data.current_address).toBe('Swiss St 1')
        })

        it('should return 500 if prisma throws on PUT', async () => {
            ; (createClient as jest.Mock).mockResolvedValue({
                auth: { getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }) }
            })
            prismaMock.profiles.findUnique.mockRejectedValue(new Error('Update Fail'))

            const request = createMockRequest('http://localhost/api/profiles', { method: 'PUT', body: '{}' })
            const response = await PUT(request)
            const { status } = await validateResponse<any>(response)

            expect(status).toBe(500)
        })
    })
})
