/**
 * Stats Users Tab Component
 * 
 * Displays user versions count in a tab.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Statistics } from '@/services/api/stats'

export interface StatsUsersTabProps {
  stats: Statistics
}

export default function StatsUsersTab({ stats }: StatsUsersTabProps) {
  const t = useTranslations('stats')

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('userVersionsCount')}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('user')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('versionsCount')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.userVersionsCount.map((user) => (
              <tr key={user.user_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">@{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">
                  {user.versions_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

