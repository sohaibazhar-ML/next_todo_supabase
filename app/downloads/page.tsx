import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DocumentList from '@/components/DocumentList'

export default async function DownloadsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Download Center</h1>
              <p className="text-gray-600 mt-1">Browse and download document templates</p>
            </div>
          </div>
        </div>

        {/* Document List */}
        <DocumentList />
      </div>
    </div>
  )
}

