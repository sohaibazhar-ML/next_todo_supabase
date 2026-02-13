import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin, isSubadmin, hasPermission } from '@/lib/utils/roles'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui'

export default async function DashboardPage() {
  const t = await getTranslations()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { first_name: true, last_name: true, username: true }
  })

  if (!profile) {
    redirect('/profile?setup=true')
  }

  // Redirect admin and subadmin to new admin dashboard
  const admin = await isAdmin(user.id)
  const subadmin = await isSubadmin(user.id)
  
  if (admin || subadmin) {
    redirect('/admin/dashboard')
  }

  const displayName = profile ? `${profile.first_name} ${profile.last_name}` : (user.email || 'User')
  const canUpload = await hasPermission(user.id, 'can_upload_documents')
  const canViewStats = await hasPermission(user.id, 'can_view_stats')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                <p className="text-gray-600 mt-1 text-sm">{t('dashboard.welcome', { name: displayName })}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/profile" className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                {t('common.profile')}
              </Link>
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="danger" size="lg" className="shadow-md hover:shadow-lg">
                  {t('common.signOut')}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center py-12">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('dashboard.welcomeToYourDashboard')}</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('dashboard.successfullyLoggedIn')}</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/profile" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                {t('dashboard.manageProfile')}
              </Link>
              <Link href="/downloads" className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                {t('dashboard.downloadCenter')}
              </Link>
              {canUpload && (
                <Link href="/admin/documents" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                  {t('dashboard.manageDocuments')}
                </Link>
              )}
              {canViewStats && (
                <Link href="/admin/stats" className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                  {t('dashboard.statistics')}
                </Link>
              )}
              {admin && (
                <Link href="/admin/subadmins" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
                  {t('dashboard.manageSubadmins')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

