import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/utils/roles'
import UserProfileView from '@/components/UserProfileView'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import type { UserRole } from '@/types/user'

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const t = await getTranslations()
  const { userId } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const admin = await isAdmin(user.id)
  
  if (!admin && user.id !== userId) {
    redirect('/profile')
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: userId }
  })

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('errors.notFound')}</h2>
              <Link
                href={admin ? '/profile' : '/dashboard'}
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium mt-4"
              >
                {t('common.back')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isOwnProfile = user.id === userId

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isOwnProfile ? t('profile.myProfile') : t('common.profile')}
              </h1>
              {!isOwnProfile && (
                <p className="text-sm text-gray-500 mt-1">
                  {profile.first_name} {profile.last_name}
                </p>
              )}
            </div>
            <Link
              href={admin && !isOwnProfile ? '/profile' : '/dashboard'}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('common.back')}
            </Link>
          </div>
          <UserProfileView 
            profile={{
              ...profile,
              email_confirmed_at: profile.email_confirmed_at?.toISOString() || null,
              created_at: profile.created_at.toISOString(),
              updated_at: profile.updated_at.toISOString(),
              role: profile.role as UserRole,
            }} 
            isOwnProfile={isOwnProfile} 
          />
        </div>
      </div>
    </div>
  )
}

