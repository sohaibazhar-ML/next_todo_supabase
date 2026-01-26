/**
 * User Filters Component
 * 
 * Reusable component for user filter inputs.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { UserFilters, RoleFilter } from '@/hooks/useUserFilters'
import { Button } from '@/components/ui'

export interface UserFiltersProps {
  filters: UserFilters
  onFilterChange: (updated: Partial<UserFilters>) => void
  onReset: () => void
}

export default function UserFiltersComponent({
  filters,
  onFilterChange,
  onReset,
}: UserFiltersProps) {
  const t = useTranslations('adminUsers')

  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.search')}
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
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
            onChange={(event) => onFilterChange({ fromDate: event.target.value })}
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
            onChange={(event) => onFilterChange({ toDate: event.target.value })}
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
              onFilterChange({
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
        <Button variant="secondary" onClick={onReset}>
          {t('filters.reset')}
        </Button>
      </div>
    </div>
  )
}

