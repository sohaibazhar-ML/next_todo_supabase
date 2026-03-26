import { serializeDocument, serializeProfile } from '@/utils/serialization'
import { isAdmin, isSubadmin, getUserRole } from '@/utils/roles'
import { isErrorWithMessage } from '@/utils/error-utils'
import { prismaMock } from '@/lib/__mocks__/prisma'

// Mock prisma as it's used in roles utility
jest.mock('@/lib/prisma')

describe('Core Utility Functions', () => {

    describe('Serialization Utils', () => {
        it('should serialize document with BigInt file_size', () => {
            const rawDoc = { id: '1', file_size: BigInt(1024) } as any
            const serialized = serializeDocument(rawDoc)
            expect(typeof serialized.file_size).toBe('number')
            expect(serialized.file_size).toBe(1024)
        })

        it('should handle already numeric file_size', () => {
            const rawDoc = { id: '1', file_size: 2048 } as any
            const serialized = serializeDocument(rawDoc)
            expect(serialized.file_size).toBe(2048)
        })

        it('should serialize profile with Date objects', () => {
            const now = new Date()
            const rawProfile = {
                id: 'p1',
                email_confirmed_at: now,
                created_at: now,
                updated_at: now,
                role: 'admin'
            } as any
            const serialized = serializeProfile(rawProfile)
            expect(typeof serialized.created_at).toBe('string')
            expect(serialized.created_at).toBe(now.toISOString())
            expect(serialized.email_confirmed_at).toBe(now.toISOString())
        })
    })

    describe('Role Utils', () => {
        beforeEach(() => jest.clearAllMocks())

        it('getUserRole should return correct role from DB', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ role: 'subadmin' } as any)
            const role = await getUserRole('u1')
            expect(role).toBe('subadmin')
        })

        it('getUserRole should default to "user" if no profile', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue(null)
            const role = await getUserRole('u99')
            expect(role).toBe('user')
        })

        it('isAdmin should return true for admin role', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ role: 'admin' } as any)
            expect(await isAdmin('admin-id')).toBe(true)
        })

        it('isSubadmin should return true for subadmin role', async () => {
            prismaMock.profiles.findUnique.mockResolvedValue({ role: 'subadmin' } as any)
            expect(await isSubadmin('sub-id')).toBe(true)
        })
    })

    describe('Error Utils', () => {
        it('isErrorWithMessage should identify objects with message property', () => {
            expect(isErrorWithMessage({ message: 'test' })).toBe(true)
            expect(isErrorWithMessage(new Error('test'))).toBe(true)
            expect(isErrorWithMessage('just a string')).toBe(false)
            expect(isErrorWithMessage(null)).toBe(false)
            expect(isErrorWithMessage({})).toBe(false)
        })
    })
})
