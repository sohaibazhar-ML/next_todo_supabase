'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { UserProfile, UserRole } from '@/types/user'
import UserViewModal from '@/components/admin-dashboard/UserViewModal'
import UserEditModal from '@/components/admin-dashboard/UserEditModal'
import { useDebounce } from '@/hooks/useDebounce'
import { useUsers } from '@/hooks/api/useUsers'

type RoleFilter = UserRole | 'all'

interface UserFilters {
  search: string
  fromDate: string
  toDate: string
  role: RoleFilter
}

interface CsvHeader {
  key: keyof UserProfile
  label: string
}

const DEFAULT_FILTERS: UserFilters = {
  search: '',
  fromDate: '',
  toDate: '',
  role: 'all',
}

export default function AdminUserManagement() {
  const t = useTranslations('adminUsers')
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)

  const debouncedSearch = useDebounce(filters.search, 300)

  // Use React Query hook for data fetching
  const { data: users = [], isLoading, error } = useUsers({
    role: filters.role !== 'all' ? filters.role : undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    search: debouncedSearch || undefined,
  })

  const handleFilterChange = (updated: Partial<UserFilters>) => {
    setFilters((current) => ({
      ...current,
      ...updated,
    }))
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const handleSelectUser = (user: UserProfile) => {
    setSelectedUser(user)
    setEditingUser(null)
  }

  const handleEditUser = (user: UserProfile) => {
    // When editing, close the view modal and open only the edit modal
    setSelectedUser(null)
    setEditingUser(user)
  }

  const handleEditCompleted = () => {
    setEditingUser(null)
    // React Query will automatically refetch when mutations invalidate the cache
  }

  const visibleUsers = useMemo(() => users, [users])

  const csvHeaders: CsvHeader[] = useMemo(
    () => [
      { key: 'id', label: 'ID' },
      { key: 'username', label: t('table.username') },
      { key: 'first_name', label: t('table.firstName') },
      { key: 'last_name', label: t('table.lastName') },
      { key: 'email', label: t('table.email') },
      { key: 'phone_number', label: t('table.phoneNumber') },
      { key: 'role', label: t('table.role') },
      { key: 'created_at', label: t('table.createdAt') },
    ],
    [t],
  )

  const handleExportCsv = () => {
    if (visibleUsers.length === 0) {
      return
    }

    const headerRow = csvHeaders.map((h) => h.label).join(',')
    const rows = visibleUsers.map((user: UserProfile) =>
      csvHeaders
        .map((header) => {
          const raw = user[header.key]
          const value =
            raw === null || raw === undefined ? '' : String(raw).trim()
          const escaped = value.replace(/"/g, '""')
          return `"${escaped}"`
        })
        .join(','),
    )

    const csvContent = [headerRow, ...rows].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', t('export.fileName'))
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('filters.search')}
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                handleFilterChange({ search: event.target.value })
              }
              placeholder={t('filters.searchPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('filters.fromDate')}
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(event) =>
                handleFilterChange({ fromDate: event.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('filters.toDate')}
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(event) =>
                handleFilterChange({ toDate: event.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('filters.role')}
            </label>
            <select
              value={filters.role}
              onChange={(event) =>
                handleFilterChange({
                  role: event.target.value as RoleFilter,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            >
              <option value="user">{t('filters.roleUser')}</option>
              <option value="subadmin">{t('filters.roleSubadmin')}</option>
              <option value="admin">{t('filters.roleAdmin')}</option>
              <option value="all">{t('filters.roleAll')}</option>
            </select>
          </div>
        </div>
        <div className="flex flex-row gap-3">
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('filters.reset')}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg shadow-sm hover:bg-purple-700 transition-colors"
          >
            {t('export.button')}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <p className="text-sm text-gray-700">
            {t('summary.count', { count: visibleUsers.length })}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <svg
              className="animate-spin h-6 w-6 text-purple-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-sm text-red-700">
                {error instanceof Error ? error.message : t('errors.fetchFailed')}
              </p>
            </div>
          </div>
        ) : visibleUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t('summary.noResults')}
          </div>
        ) : (
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
                {visibleUsers.map((user: UserProfile) => (
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
                        <button
                          type="button"
                          onClick={() => handleSelectUser(user)}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {t('table.view')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditUser(user)}
                          className="px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
                        >
                          {t('table.edit')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserViewModal
        user={selectedUser}
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
      />

      <UserEditModal
        user={editingUser}
        isOpen={editingUser !== null}
        onClose={() => setEditingUser(null)}
        onSaved={handleEditCompleted}
      />
    </div>
  )
}


