import { getUserRole, isAdmin, isSubadmin, getSubadminPermissions, hasPermission, requirePermission, requireAdmin } from './roles'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
    prisma: {
        profiles: {
            findUnique: jest.fn()
        },
        subadmin_permissions: {
            findUnique: jest.fn()
        }
    }
}))

describe('Roles Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('getUserRole', () => {
        it('should return role from profile', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' })
            expect(await getUserRole('user-1')).toBe('admin')
        })

        it('should return user if profile not found', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue(null)
            expect(await getUserRole('user-1')).toBe('user')
        })
    })

    describe('isAdmin', () => {
        it('should return true if role is admin', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' })
            expect(await isAdmin('user-1')).toBe(true)
        })

        it('should return false if role is not admin', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'user' })
            expect(await isAdmin('user-1')).toBe(false)
        })
    })

    describe('isSubadmin', () => {
        it('should return true if role is subadmin', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'subadmin' })
            expect(await isSubadmin('user-1')).toBe(true)
        })

        it('should return false if role is not subadmin', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'user' })
            expect(await isSubadmin('user-1')).toBe(false)
        })
    })

    describe('getSubadminPermissions', () => {
        it('should return permissions', async () => {
            const perms = { can_upload_documents: true, can_view_stats: false, is_active: true }
                ; (prisma.subadmin_permissions.findUnique as jest.Mock).mockResolvedValue(perms)
            expect(await getSubadminPermissions('user-1')).toEqual(perms)
        })

        it('should return null if not found', async () => {
            (prisma.subadmin_permissions.findUnique as jest.Mock).mockResolvedValue(null)
            expect(await getSubadminPermissions('user-1')).toBeNull()
        })
    })

    describe('hasPermission', () => {
        it('should return true for admin', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' })
            expect(await hasPermission('user-1', 'can_upload_documents')).toBe(true)
        })

        it('should check subadmin permissions', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'subadmin' })
                ; (prisma.subadmin_permissions.findUnique as jest.Mock).mockResolvedValue({
                    can_upload_documents: true,
                    is_active: true
                })
            expect(await hasPermission('user-1', 'can_upload_documents')).toBe(true)
        })

        it('should return false if subadmin inactive', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'subadmin' })
                ; (prisma.subadmin_permissions.findUnique as jest.Mock).mockResolvedValue({
                    can_upload_documents: true,
                    is_active: false
                })
            expect(await hasPermission('user-1', 'can_upload_documents')).toBe(false)
        })

        it('should return false if subadmin permission denied', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'subadmin' })
                ; (prisma.subadmin_permissions.findUnique as jest.Mock).mockResolvedValue({
                    can_upload_documents: false,
                    is_active: true
                })
            expect(await hasPermission('user-1', 'can_upload_documents')).toBe(false)
        })

        it('should return false if subadmin permissions not found', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'subadmin' })
                ; (prisma.subadmin_permissions.findUnique as jest.Mock).mockResolvedValue(null)
            expect(await hasPermission('user-1', 'can_upload_documents')).toBe(false)
        })

        it('should return false for user', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'user' })
            expect(await hasPermission('user-1', 'can_upload_documents')).toBe(false)
        })
    })

    describe('requirePermission', () => {
        it('should succeed if has permission', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' })
            await expect(requirePermission('user-1', 'can_upload_documents')).resolves.not.toThrow()
        })

        it('should throw if no permission', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'user' })
            await expect(requirePermission('user-1', 'can_upload_documents'))
                .rejects.toThrow('Permission required: can_upload_documents')
        })
    })

    describe('requireAdmin', () => {
        it('should succeed if admin', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'admin' })
            await expect(requireAdmin('user-1')).resolves.not.toThrow()
        })

        it('should throw if not admin', async () => {
            (prisma.profiles.findUnique as jest.Mock).mockResolvedValue({ role: 'user' })
            await expect(requireAdmin('user-1'))
                .rejects.toThrow('Admin access required')
        })
    })
})
