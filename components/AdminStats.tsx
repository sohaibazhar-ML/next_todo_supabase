'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { isErrorWithMessage } from '@/types'
import { API_ENDPOINTS, ERROR_MESSAGES } from '@/constants'

interface StatsData {
  summary: {
    totalUsers: number
    totalAdmins: number
    totalDocuments: number
  }
  downloadsPerDocument: Array<{
    id: string
    title: string
    file_name: string
    category: string
    total_downloads: number
    filtered_downloads: number
  }>
  versionDownloads: Array<{
    id: string
    version_number: number
    version_name: string | null
    document_title: string
    document_file_name: string
    exported_file_path: string | null
    exported_file_size: string | null
    created_at: string
  }>
  userVersionsCount: Array<{
    user_id: string
    email: string
    name: string
    username: string
    versions_count: number
  }>
  userDocumentDownloads: Array<{
    id: string
    user_email: string
    user_name: string
    document_title: string
    document_file_name: string
    document_category: string
    downloaded_at: string | null
  }>
  filterOptions: {
    categories: string[]
    tags: string[]
  }
}

export default function AdminStats() {
  const t = useTranslations('stats')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  
  // Filters
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [search, setSearch] = useState('') // Unified search
  const [category, setCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // Active tabs
  const [activeTab, setActiveTab] = useState<'summary' | 'downloads' | 'versions' | 'users'>('summary')

  const fetchStats = useCallback(async (filters?: {
    fromDate?: string
    toDate?: string
    search?: string
    category?: string
    selectedTags?: string[]
  }) => {
    try {
      setLoading(true)
      setError(null)

      // Use provided filters or current state
      const filterFromDate = filters?.fromDate !== undefined ? filters.fromDate : fromDate
      const filterToDate = filters?.toDate !== undefined ? filters.toDate : toDate
      const filterSearch = filters?.search !== undefined ? filters.search : search
      const filterCategory = filters?.category !== undefined ? filters.category : category
      const filterSelectedTags = filters?.selectedTags !== undefined ? filters.selectedTags : selectedTags

      const params = new URLSearchParams()
      if (filterFromDate) params.append('fromDate', filterFromDate)
      if (filterToDate) params.append('toDate', filterToDate)
      if (filterSearch) params.append('search', filterSearch)
      if (filterCategory) params.append('category', filterCategory)
      if (filterSelectedTags.length > 0) params.append('tags', filterSelectedTags.join(','))

      const response = await fetch(`${API_ENDPOINTS.ADMIN_STATS}?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats')
      }

      setStats(data)
    } catch (err) {
      const errorMessage = isErrorWithMessage(err)
        ? err.message
        : ERROR_MESSAGES.FETCH_STATISTICS
      setError(errorMessage)
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }, [fromDate, toDate, search, category, selectedTags])

  // Initial load
  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleSubmit = () => {
    fetchStats()
  }

  const clearFilters = () => {
    setFromDate('')
    setToDate('')
    setSearch('')
    setCategory('')
    setSelectedTags([])
    // Apply cleared filters immediately
    fetchStats({
      fromDate: '',
      toDate: '',
      search: '',
      category: '',
      selectedTags: [],
    })
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6 relative">
      {/* Loading overlay when filters are being applied */}
      {loading && stats && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">{t('loading')}</p>
          </div>
        </div>
      )}
      
      {/* Disable pointer events when loading */}
      <div className={loading && stats ? 'pointer-events-none opacity-60' : ''}>
        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('filters')}</h2>
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('clearFilters')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {t('applying') || 'Applying...'}
                  </>
                ) : (
                  t('applyFilters') || 'Apply Filters'
                )}
              </button>
            </div>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fromDate')}
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
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
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
            />
          </div>
          
          {/* Unified Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('search')}
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('category')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
            >
              <option value="">{t('allCategories')}</option>
              {stats.filterOptions.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Tags Filter */}
        {stats.filterOptions.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('tags')}
            </label>
            <div className="flex flex-wrap gap-2">
              {stats.filterOptions.tags.slice(0, 20).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
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
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('totalUsers')}</p>
              <p className="text-3xl font-bold mt-2">{stats.summary.totalUsers}</p>
            </div>
            <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">{t('totalAdmins')}</p>
              <p className="text-3xl font-bold mt-2">{stats.summary.totalAdmins}</p>
            </div>
            <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{t('totalDocuments')}</p>
              <p className="text-3xl font-bold mt-2">{stats.summary.totalDocuments}</p>
            </div>
            <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

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
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('downloadsPerDocument')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('document')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('totalDownloads')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('filteredDownloads')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.downloadsPerDocument.slice(0, 20).map(doc => (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                          <div className="text-sm text-gray-500">{doc.file_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.total_downloads}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{doc.filtered_downloads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'downloads' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('userDocumentDownloads')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('user')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('document')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('category')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('downloadedAt')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.userDocumentDownloads.slice(0, 50).map(download => (
                    <tr key={download.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{download.user_name}</div>
                        <div className="text-sm text-gray-500">{download.user_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{download.document_title}</div>
                        <div className="text-sm text-gray-500">{download.document_file_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{download.document_category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {download.downloaded_at ? new Date(download.downloaded_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'versions' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('versionDownloads')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('document')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('version')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fileSize')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('createdAt')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.versionDownloads.slice(0, 50).map(version => (
                    <tr key={version.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{version.document_title}</div>
                        <div className="text-sm text-gray-500">{version.document_file_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {t('version')} {version.version_number}
                        {version.version_name && ` - ${version.version_name}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {version.exported_file_size ? `${(parseInt(version.exported_file_size) / 1024).toFixed(2)} KB` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(version.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('userVersionsCount')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('user')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('email')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('versionsCount')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.userVersionsCount.map(user => (
                    <tr key={user.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{user.versions_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

