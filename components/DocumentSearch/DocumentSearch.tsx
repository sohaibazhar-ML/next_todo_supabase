/**
 * Document Search Component
 * 
 * Main component for document search with filters.
 * Uses React Hook Form for form management.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { DocumentSearchFilters } from '@/types/document'
import { useDocumentSearchForm } from './useDocumentSearchForm'
import DocumentSearchFields from './DocumentSearchFields'

export interface DocumentSearchProps {
  filters: DocumentSearchFilters
  onFilterChange: (filters: DocumentSearchFilters) => void
  categories: string[]
  fileTypes: string[]
  tags: string[]
}

export default function DocumentSearch({
  filters,
  onFilterChange,
  categories,
  fileTypes,
  tags,
}: DocumentSearchProps) {
  const t = useTranslations('documentSearch')
  
  const { form, onSubmit, onReset } = useDocumentSearchForm({
    initialFilters: filters,
    onFilterChange,
  })

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.category ||
    filters.fileType ||
    (filters.tags && filters.tags.length > 0) ||
    filters.featuredOnly
  )

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <DocumentSearchFields
        form={form}
        categories={categories}
        fileTypes={fileTypes}
        tags={tags}
        onReset={onReset}
        hasActiveFilters={hasActiveFilters}
      />
    </form>
  )
}

