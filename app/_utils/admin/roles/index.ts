import 'server-only';
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/types/user'

export async function getUserRole(userId: string): Promise<UserRole> {
  const profile = await prisma.profiles.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  
  return (profile?.role as UserRole) || 'user'
}

/**
 * PRODUCTION OPTIMIZATION: Fetches multiple role flags in a single DB query.
 * Use this in API routes to avoid redundant roundtrips.
 */
export async function getUserPermissions(userId: string) {
  const role = await getUserRole(userId);
  return {
    role,
    isAdmin: role === 'admin',
    isSubadmin: role === 'subadmin',
    isManager: role === 'admin' || role === 'subadmin'
  };
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin'
}

export async function isSubadmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'subadmin'
}

export async function requireAdmin(userId: string): Promise<void> {
  const admin = await isAdmin(userId)
  if (!admin) {
    throw new Error('Admin access required')
  }
}

