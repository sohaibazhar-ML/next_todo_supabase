import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProfileForm } from '@/components/forms/ProfileForm'
import UserList from '@/components/UserList'
import { isAdmin } from '@/lib/utils/roles'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default async function ProfilePage() {
  const t = await getTranslations()
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id }
  })

  if (!profile) {
    const userEmail = user.email || ''
    const userName = user.user_metadata?.full_name || user.user_metadata?.name || ''
    const nameParts = userName.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profile.completeYourProfile')}</h1>
              <p className="text-gray-600">{t('profile.completeProfileDescription')}</p>
            </div>
            <ProfileForm 
              userId={user.id}
              initialProfile={null} 
              userEmail={userEmail}
              userFirstName={firstName}
              userLastName={lastName}
            />
          </div>
        </div>
      </div>
    )
  }

  const admin = await isAdmin(user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{t('profile.myProfile')}</h1>
                  {admin && (
                    <p className="text-sm text-purple-600 mt-1 font-medium">{t('profile.adminAccount')}</p>
                  )}
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('profile.backToDashboard')}
                </Link>
              </div>
              <ProfileForm 
                userId={user.id}
                initialProfile={{
                  ...profile,
                  email_confirmed_at: profile.email_confirmed_at?.toISOString() || null,
                  created_at: profile.created_at.toISOString(),
                  updated_at: profile.updated_at.toISOString(),
                  role: profile.role as 'user' | 'admin',
                }} 
              />
            </div>
          </div>

          {admin && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{t('profile.userManagement')}</h2>
                </div>
                <UserList />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

