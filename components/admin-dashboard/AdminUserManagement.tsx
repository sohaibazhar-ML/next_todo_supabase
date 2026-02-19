'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { UserProfile } from '@/types/user'
import { IconSpinner } from '@/components/ui/icons'
import { ErrorMessage } from '@/components/ui'
import { useUserFilters, type RoleFilter } from '@/hooks/useUserFilters'
import { useCsvExport, type CsvHeader } from '@/hooks/useCsvExport'
import { useUsers } from '@/hooks/api/useUsers'
import UserViewModal from '@/components/admin-dashboard/UserViewModal'
import UserEditModal from '@/components/admin-dashboard/UserEditModal'
import UserFiltersComponent from '@/components/admin-dashboard/UserFilters'
import UserTable from '@/components/admin-dashboard/UserTable'

export default function AdminUserManagement() {
  const t = useTranslations('adminUsers')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)

  // Use custom hooks for filters and data fetching
  const { filters, updateFilter, resetFilters, apiFilters } = useUserFilters()
  const { data: users = [], isLoading, error } = useUsers(apiFilters)

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

  const visibleUsers = users

  const csvHeaders: CsvHeader<UserProfile>[] = useMemo(
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

  const { exportToCsv } = useCsvExport({
    data: visibleUsers,
    headers: csvHeaders,
    filename: t('export.fileName'),
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <UserFiltersComponent
          filters={filters}
          onFilterChange={updateFilter}
          onReset={resetFilters}
        />
        <div className="flex flex-row gap-3">
          <button
            type="button"
            onClick={exportToCsv}
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
            <IconSpinner className="h-6 w-6 text-purple-600" />
          </div>
        ) : error ? (
          <div className="p-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-sm text-red-700">
                {error instanceof Error ? error.message : t('errors.fetchFailed')}
              </p>
            </div>
          </div>
        ) : (
          <UserTable
            users={visibleUsers}
            onView={handleSelectUser}
            onEdit={handleEditUser}
          />
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


