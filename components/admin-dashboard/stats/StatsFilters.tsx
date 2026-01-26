/**
 * Stats Filters Component
 * 
 * Reusable component for statistics filter inputs.
 */

'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui'
import { IconSpinner } from '@/components/ui/icons'
import type { Statistics } from '@/services/api/stats'

export interface StatsFiltersProps {
  fromDate: string
  toDate: string
  search: string
  category: string
  selectedTags: string[]
  filterOptions: Statistics['filterOptions']
  isLoading: boolean
  onFromDateChange: (value: string) => void
  onToDateChange: (value: string) => void
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onTagToggle: (tag: string) => void
  onClearFilters: () => void
  onApplyFilters: () => void
}

export default function StatsFilters({
  fromDate,
  toDate,
  search,
  category,
  selectedTags,
  filterOptions,
  isLoading,
  onFromDateChange,
  onToDateChange,
  onSearchChange,
  onCategoryChange,
  onTagToggle,
  onClearFilters,
  onApplyFilters,
}: StatsFiltersProps) {
  const t = useTranslations('stats')

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{t('filters')}</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClearFilters} disabled={isLoading}>
            {t('clearFilters')}
          </Button>
          <Button variant="primary" onClick={onApplyFilters} disabled={isLoading}>
            {isLoading ? (
              <>
                <IconSpinner className="h-4 w-4 text-white" />
                {t('applying') || 'Applying...'}
              </>
            ) : (
              t('applyFilters') || 'Apply Filters'
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('fromDate')}
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('toDate')}
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('search')}
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('category')}
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
          >
            <option value="">{t('allCategories')}</option>
            {filterOptions.categories.map((cat: string) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filterOptions.tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('tags')}
          </label>
          <div className="flex flex-wrap gap-2">
            {filterOptions.tags.slice(0, 20).map((tag: string) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagToggle(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

