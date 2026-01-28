/**
 * Document List Component
 * 
 * Displays a list of documents with search and filter functionality.
 * 
 * Features:
 * - Document listing with filters
 * - Search functionality
 * - Category, file type, and tag filtering
 * - Featured documents filter
 * 
 * This component has been refactored to:
 * - Use constants from @/constants
 * - Remove all 'any' types
 * - Use proper TypeScript types
 * - Improve error handling
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { DocumentSearchFilters } from '@/types/document'
import { useDocuments, useDocumentFilterOptions } from '@/hooks/api/useDocuments'
import { IconSpinner, IconFile } from '@/components/ui/icons'
import { UI_TEXT } from '@/constants'
import DocumentCard from './DocumentCard'
import { DocumentSearch } from './DocumentSearch'

export default function DocumentList() {
  const t = useTranslations('documentList')
  const [filters, setFilters] = useState<DocumentSearchFilters>({})

  // Use React Query hooks for data fetching
  const { data: documents = [], isLoading, error } = useDocuments(filters)
  const { data: filterOptions } = useDocumentFilterOptions()
  
  const categories = filterOptions?.categories || []
  const fileTypes = filterOptions?.fileTypes || []
  const tags = filterOptions?.tags || []

  const handleFilterChange = (newFilters: DocumentSearchFilters) => {
    setFilters(newFilters)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12">
        <div className="flex justify-center items-center py-12">
          <IconSpinner className="h-12 w-12 text-indigo-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-700">
            {error instanceof Error ? error.message : UI_TEXT.MESSAGES.FETCH_DOCUMENTS_FAILED}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <DocumentSearch
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
          fileTypes={fileTypes}
          tags={tags}
        />
      </div>

      <div className="flex justify-between items-center">
        <p className="text-white font-medium">
          {t('documentsFound', { count: documents.length })}
        </p>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <IconFile className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noDocuments')}</h3>
            <p className="text-gray-600">
              {filters.searchQuery || filters.category || filters.fileType
                ? t('adjustFilters')
                : t('noDocumentsYet')}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  )
}
