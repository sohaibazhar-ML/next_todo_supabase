import { prisma } from '@/lib/prisma'
import type { UserRole, SubadminPermissions } from '@/types/user'

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

export async function isSubadmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'subadmin'
}

export async function getSubadminPermissions(userId: string): Promise<SubadminPermissions | null> {
  const permissions = await prisma.subadmin_permissions.findUnique({
    where: { user_id: userId },
    select: {
      can_upload_documents: true,
      can_view_stats: true,
      is_active: true,
    }
  })
  
  return permissions
}

export async function hasPermission(userId: string, permission: 'can_upload_documents' | 'can_view_stats'): Promise<boolean> {
  // Admins have all permissions
  if (await isAdmin(userId)) {
    return true
  }
  
  // Check subadmin permissions
  if (await isSubadmin(userId)) {
    const subadminPerms = await getSubadminPermissions(userId)
    if (!subadminPerms || !subadminPerms.is_active) {
      return false
    }
    return subadminPerms[permission]
  }
  
  return false
}

export async function requirePermission(userId: string, permission: 'can_upload_documents' | 'can_view_stats'): Promise<void> {
  const hasPerm = await hasPermission(userId, permission)
  if (!hasPerm) {
    throw new Error(`Permission required: ${permission}`)
  }
}

export async function requireAdmin(userId: string): Promise<void> {
  const admin = await isAdmin(userId)
  if (!admin) {
    throw new Error('Admin access required')
  }
}

