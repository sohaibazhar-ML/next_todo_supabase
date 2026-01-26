/**
 * User Table Component
 * 
 * Reusable component for displaying users in a table format.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { UserProfile } from '@/types/user'
import { Button } from '@/components/ui'

export interface UserTableProps {
  users: UserProfile[]
  onView: (user: UserProfile) => void
  onEdit: (user: UserProfile) => void
}

export default function UserTable({ users, onView, onEdit }: UserTableProps) {
  const t = useTranslations('adminUsers')

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        {t('summary.noResults')}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.name')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.email')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.username')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.role')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.createdAt')}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user: UserProfile) => (
            <tr key={user.id}>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {user.first_name} {user.last_name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {user.email}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {user.username}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role === 'subadmin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                <div className="inline-flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(user)}
                  >
                    {t('table.view')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    {t('table.edit')}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

