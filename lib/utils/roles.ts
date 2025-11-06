import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/user'

export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return (data?.role as UserRole) || 'user'
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

