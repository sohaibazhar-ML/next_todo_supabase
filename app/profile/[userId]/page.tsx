import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/utils/roles'
import UserProfileView from '@/components/UserProfileView'

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if current user is admin
  const admin = await isAdmin(user.id)
  
  // If not admin, only allow viewing own profile
  if (!admin && user.id !== userId) {
    redirect('/profile')
  }

  // Fetch the profile to view
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Profile Not Found
              </h2>
              <Link
                href={admin ? '/profile' : '/dashboard'}
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium mt-4"
              >
                {admin ? 'Back to User List' : 'Back to Dashboard'}
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isOwnProfile ? 'My Profile' : 'User Profile'}
              </h1>
              {!isOwnProfile && (
                <p className="text-sm text-gray-500 mt-1">
                  Viewing profile of {profile.first_name} {profile.last_name}
                </p>
              )}
            </div>
            <Link
              href={admin && !isOwnProfile ? '/profile' : '/dashboard'}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {admin && !isOwnProfile ? 'Back to User List' : 'Back to Dashboard'}
            </Link>
          </div>
          <UserProfileView profile={profile} isOwnProfile={isOwnProfile} />
        </div>
      </div>
    </div>
  )
}

