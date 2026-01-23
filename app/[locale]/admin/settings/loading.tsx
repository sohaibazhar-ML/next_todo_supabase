import { createClient } from '@/lib/supabase/server'
import { isAdmin, isSubadmin, hasPermission } from '@/lib/utils/roles'
import { prisma } from '@/lib/prisma'
import AdminLayoutSkeleton from '@/components/admin-dashboard/AdminLayoutSkeleton'
import type { UserRole } from '@/types/user'

export default async function Loading() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <AdminLayoutSkeleton userRole="user" permissions={{ canUpload: false, canViewStats: false }} />
  }

  const admin = await isAdmin(user.id)
  const subadmin = await isSubadmin(user.id)

  if (!admin && !subadmin) {
    return <AdminLayoutSkeleton userRole="user" permissions={{ canUpload: false, canViewStats: false }} />
  }

  const canUpload = await hasPermission(user.id, 'can_upload_documents')
  const canViewStats = await hasPermission(user.id, 'can_view_stats')

  // Get user profile for display
  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { first_name: true, last_name: true, email: true },
  })

  const userName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : user.email || 'User'
  
  const userEmail = profile?.email || user.email || ''

  const userRole: UserRole = admin ? 'admin' : 'subadmin'

  return (
    <AdminLayoutSkeleton
      userRole={userRole}
      permissions={{
        canUpload,
        canViewStats,
      }}
      userName={userName}
      userEmail={userEmail}
    />
  )
}

