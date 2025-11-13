import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileForm from '@/components/ProfileForm'
import UserList from '@/components/UserList'
import { isAdmin } from '@/lib/utils/roles'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Try to fetch profile - use maybeSingle() to avoid error if not found
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Check if there's an actual error (not just "not found")
  const isNotFoundError = profileError?.code === 'PGRST116' || 
                         profileError?.message?.includes('No rows') ||
                         (!profileError && !profile)

  if (isNotFoundError || (!profile && !profileError)) {
    // Profile doesn't exist - this shouldn't happen if signup worked correctly
    // But we'll handle it gracefully
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Profile Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                Your profile could not be found in the database. This may have occurred if profile creation failed during signup.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                User ID: {user.id}
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If there's a real error (not just "not found")
  if (profileError && !isNotFoundError) {
    console.error('Profile fetch error:', profileError)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Error Loading Profile
              </h2>
              <p className="text-gray-600 mb-4">
                An error occurred while loading your profile.
              </p>
              <p className="text-sm text-red-600 mb-6 font-mono bg-red-50 p-3 rounded">
                {profileError.message || JSON.stringify(profileError)}
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if user is admin
  const admin = await isAdmin(user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                  {admin && (
                    <p className="text-sm text-purple-600 mt-1 font-medium">
                      Admin Account
                    </p>
                  )}
                </div>
                <Link
                  href="/dashboard"
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
                  Back to Dashboard
                </Link>
              </div>
              <ProfileForm initialProfile={profile} />
            </div>
          </div>

          {/* Admin Panel - User List */}
          {admin && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">User Management</h2>
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

//