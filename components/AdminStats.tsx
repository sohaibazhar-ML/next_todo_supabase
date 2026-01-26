'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStatistics } from '@/hooks/api/useStats'
import type { Statistics } from '@/services/api/stats'
import { IconSpinner } from '@/components/ui/icons'
import { ErrorMessage, LoadingOverlay } from '@/components/ui'
import { ERROR_MESSAGES } from '@/constants'
import {
  StatsFilters,
  StatsSummaryCards,
  StatsSummaryTab,
  StatsDownloadsTab,
  StatsVersionsTab,
  StatsUsersTab,
} from '@/components/admin-dashboard/stats'

export default function AdminStats() {
  const t = useTranslations('stats')
  
  // Filters
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [search, setSearch] = useState('') // Unified search
  const [category, setCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Active tabs
  const [activeTab, setActiveTab] = useState<'summary' | 'downloads' | 'versions' | 'users'>('summary')

  // Use React Query hook for data fetching
  const { data: stats, isLoading, error, refetch } = useStatistics({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    search: search || undefined,
    category: category || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
  })

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = () => {
    refetch()
  }

  const clearFilters = () => {
    setFromDate('')
    setToDate('')
    setSearch('')
    setCategory('')
    setSelectedTags([])
  }

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <IconSpinner className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-sm text-red-700">
          {error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_STATISTICS}
        </p>
      </div>
    )
  }

  if (!stats) return null

  return (
    <LoadingOverlay isLoading={isLoading && !!stats} message={t('loading')} className="space-y-6">
      <StatsFilters
        fromDate={fromDate}
        toDate={toDate}
        search={search}
        category={category}
        selectedTags={selectedTags}
        filterOptions={stats.filterOptions}
        isLoading={isLoading}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onTagToggle={handleTagToggle}
        onClearFilters={clearFilters}
        onApplyFilters={handleSubmit}
      />

      <StatsSummaryCards stats={stats} />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['summary', 'downloads', 'versions', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t(`tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'summary' && <StatsSummaryTab stats={stats} />}
        {activeTab === 'downloads' && <StatsDownloadsTab stats={stats} />}
        {activeTab === 'versions' && <StatsVersionsTab stats={stats} />}
        {activeTab === 'users' && <StatsUsersTab stats={stats} />}
      </div>
    </LoadingOverlay>
  )
}

