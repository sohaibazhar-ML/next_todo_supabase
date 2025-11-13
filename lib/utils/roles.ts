import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/types/user'

export async function getUserRole(userId: string): Promise<UserRole> {
  const profile = await prisma.profiles.findUnique({
    where: { id: userId },
    select: { role: true }
  })
  
  return (profile?.role as UserRole) || 'user'
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'admin'
}

export async function requireAdmin(userId: string): Promise<void> {
  const admin = await isAdmin(userId)
  if (!admin) {
    throw new Error('Admin access required')
  }
}

