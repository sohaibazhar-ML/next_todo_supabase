/**
 * Stats Filters Component
 * 
 * Reusable component for statistics filter inputs.
 * Refactored to use grouped filter props for better maintainability.
 */

'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui'
import { IconSpinner } from '@/components/ui/icons'
import type { StatsFiltersState, StatsFilterOptions } from '@/types'

export interface StatsFiltersProps {
  filters: StatsFiltersState
  filterOptions: StatsFilterOptions
  isLoading: boolean
  onFiltersChange: (updates: Partial<StatsFiltersState>) => void
  onTagToggle: (tag: string) => void
  onClearFilters: () => void
  onApplyFilters: () => void
}

export default function StatsFilters({
  filters,
  filterOptions,
  isLoading,
  onFiltersChange,
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
            value={filters.fromDate}
            onChange={(e) => onFiltersChange({ fromDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('toDate')}
          </label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => onFiltersChange({ toDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('search')}
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            placeholder={t('searchPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('category')}
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ category: e.target.value })}
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
                  filters.selectedTags.includes(tag)
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

