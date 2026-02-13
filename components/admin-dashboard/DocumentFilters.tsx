/**
 * Document Filters Component
 * 
 * Reusable component for document filter inputs.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { DocumentFilters, SortOption } from '@/hooks/useDocumentFilters'
import { Button } from '@/components/ui'

export interface DocumentFiltersProps {
  filters: DocumentFilters
  categories: string[]
  onFilterChange: (key: keyof DocumentFilters, value: string) => void
  onReset: () => void
}

export default function DocumentFiltersComponent({
  filters,
  categories,
  onFilterChange,
  onReset,
}: DocumentFiltersProps) {
  const t = useTranslations('adminDocuments')

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('filters.title')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.search')}
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.category')}
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
          >
            <option value="">{t('filters.allCategories')}</option>
            {categories.map((cat: string) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.fromDate')}
          </label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => onFilterChange('fromDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.toDate')}
          </label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => onFilterChange('toDate', e.target.value)}
            min={filters.fromDate || undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('filters.sort')}
          </label>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
          >
            <option value="created_at_desc">{t('filters.sortNewest')}</option>
            <option value="created_at_asc">{t('filters.sortOldest')}</option>
            <option value="title_asc">{t('filters.sortTitleAsc')}</option>
            <option value="title_desc">{t('filters.sortTitleDesc')}</option>
            <option value="download_count_desc">
              {t('filters.sortDownloadsDesc')}
            </option>
            <option value="download_count_asc">
              {t('filters.sortDownloadsAsc')}
            </option>
          </select>
        </div>

        <div className="flex items-end">
          <Button variant="secondary" onClick={onReset} className="w-full">
            {t('filters.reset')}
          </Button>
        </div>
      </div>
    </div>
  )
}

