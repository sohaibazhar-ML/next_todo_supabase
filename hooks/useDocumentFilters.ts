/**
 * Document Filters Hook
 * 
 * Custom hook for managing document filter state.
 */

import { useState, useMemo } from 'react'
import { useDebounce } from './useDebounce'
import { DEFAULT_VALUES } from '@/constants'
import type { DocumentSearchFilters } from '@/types/document'

export type SortOption =
  | 'created_at_desc'
  | 'created_at_asc'
  | 'title_asc'
  | 'title_desc'
  | 'download_count_desc'
  | 'download_count_asc'

export interface DocumentFilters {
  search: string
  fromDate: string
  toDate: string
  category: string
  sort: SortOption
}

export interface UseDocumentFiltersOptions {
  /**
   * Initial filters
   */
  initialFilters?: Partial<DocumentFilters>
}

export interface UseDocumentFiltersReturn {
  /**
   * Current filters
   */
  filters: DocumentFilters
  
  /**
   * Update filters
   */
  setFilters: React.Dispatch<React.SetStateAction<DocumentFilters>>
  
  /**
   * Update specific filter
   */
  updateFilter: (key: keyof DocumentFilters, value: string) => void
  
  /**
   * Reset filters to default
   */
  resetFilters: () => void
  
  /**
   * Debounced search value
   */
  debouncedSearch: string
  
  /**
   * Filters formatted for API
   */
  apiFilters: DocumentSearchFilters
}

const DEFAULT_FILTERS: DocumentFilters = {
  search: '',
  fromDate: '',
  toDate: '',
  category: '',
  sort: 'created_at_desc',
}

/**
 * Hook for managing document filters
 */
export function useDocumentFilters({
  initialFilters,
}: UseDocumentFiltersOptions = {}): UseDocumentFiltersReturn {
  const [filters, setFilters] = useState<DocumentFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  })

  const debouncedSearch = useDebounce(filters.search, DEFAULT_VALUES.DEBOUNCE_DELAY)

  const updateFilter = (key: keyof DocumentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const apiFilters: DocumentSearchFilters = useMemo(
    () => ({
      searchQuery: debouncedSearch || undefined,
      category: filters.category || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      sort: filters.sort || undefined,
    }),
    [debouncedSearch, filters.category, filters.fromDate, filters.toDate, filters.sort]
  )

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    debouncedSearch,
    apiFilters,
  }
}

