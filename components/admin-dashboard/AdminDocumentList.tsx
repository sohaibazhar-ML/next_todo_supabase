'use client'

import { useTranslations } from 'next-intl'
import { useDocuments, useDocumentFilterOptions } from '@/hooks/api/useDocuments'
import { useDocumentFilters } from '@/hooks/useDocumentFilters'
import { ErrorMessage } from '@/components/ui'
import { IconSpinner } from '@/components/ui/icons'
import DocumentFiltersComponent from './DocumentFilters'
import DocumentTable from './DocumentTable'

export default function AdminDocumentList() {
  const t = useTranslations('adminDocuments')

  // Use custom hooks for filters and data fetching
  const { filters, updateFilter, resetFilters, apiFilters } = useDocumentFilters()
  const { data: documents = [], isLoading, error } = useDocuments(apiFilters)
  const { data: filterOptions } = useDocumentFilterOptions()
  
  const categories = filterOptions?.categories || []

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <IconSpinner className="h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DocumentFiltersComponent
        filters={filters}
        categories={categories}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />

      {error && (
        <ErrorMessage
          message={
            error instanceof Error
              ? error.message
              : typeof error === 'string'
              ? error
              : t('errors.fetchFailed')
          }
        />
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.fileType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.fileSize')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.downloads')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.createdAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <DocumentTable documents={documents} isLoading={isLoading} />
            </tbody>
          </table>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="text-sm text-gray-600">
          {t('resultsCount', { count: documents.length })}
        </div>
      )}
    </div>
  )
}
