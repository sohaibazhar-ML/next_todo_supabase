'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useUsers } from '@/hooks/api/useUsers'
import { IconSpinner } from '@/components/ui/icons'
import { ERROR_MESSAGES, ROUTES } from '@/constants'
import { IconChevronRight } from '@/components/ui/icons'

export default function UserList() {
  const t = useTranslations('userList')
  
  // Use React Query hook for data fetching
  const { data: users = [], isLoading, error } = useUsers({ role: 'user' })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <IconSpinner className="h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-sm text-red-700">
          {error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_USERS_GENERIC}
        </p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t('noUsers')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('allUsers')}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{users.length}</span>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
        {users.map((user) => (
          <Link
            key={user.id}
            href={ROUTES.PROFILE(user.id)}
            className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 hover:border-indigo-300 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{user.first_name} {user.last_name}</h4>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                <p className="text-xs text-gray-400 truncate mt-1">{user.email}</p>
              </div>
              <IconChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
