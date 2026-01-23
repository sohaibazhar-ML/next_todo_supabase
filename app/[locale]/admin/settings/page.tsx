import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin, isSubadmin, hasPermission } from '@/lib/utils/roles'
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'
import { serializeProfile } from '@/lib/utils/serialization'
import AdminLayout from '@/components/admin-dashboard/AdminLayout'
import SettingsContent from '@/components/admin-dashboard/SettingsContent'
import type { UserRole } from '@/types/user'

export default async function AdminSettingsPage() {
  const t = await getTranslations()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = await isAdmin(user.id)
  const subadmin = await isSubadmin(user.id)

  if (!admin && !subadmin) {
    redirect('/dashboard')
  }

  const canUpload = await hasPermission(user.id, 'can_upload_documents')
  const canViewStats = await hasPermission(user.id, 'can_view_stats')

  // Get user profile
  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
  })

  if (!profile) {
    redirect('/profile?setup=true')
  }

  // Convert Prisma profile to UserProfile type (serialize dates to strings)
  const userProfile = serializeProfile(profile)

  const userName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : user.email || 'User'
  
  const userEmail = profile?.email || user.email || ''

  const userRole: UserRole = admin ? 'admin' : 'subadmin'

  return (
    <AdminLayout
      userRole={userRole}
      permissions={{
        canUpload,
        canViewStats,
      }}
      userName={userName}
      userEmail={userEmail}
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-gray-600 mt-1">{t('settings.description')}</p>
        </div>
        <SettingsContent profile={userProfile} />
      </div>
    </AdminLayout>
  )
}

