'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { UserProfile } from '@/types/user'
import { API_ENDPOINTS } from '@/constants'

export default function UserList() {
  const t = useTranslations('userList')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(API_ENDPOINTS.PROFILES + '?role=user')
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch users')
        return
      }

      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
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
            href={`/profile/${user.id}`}
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
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
