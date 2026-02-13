/**
 * User Filters Hook
 * 
 * Custom hook for managing user filter state.
 */

import { useState, useMemo } from 'react'
import { useDebounce } from './useDebounce'
import { DEFAULT_VALUES } from '@/constants'
import type { UserRole } from '@/types/user'

export type RoleFilter = UserRole | 'all'

export interface UserFilters {
  search: string
  fromDate: string
  toDate: string
  role: RoleFilter
}

export interface UseUserFiltersOptions {
  /**
   * Initial filters
   */
  initialFilters?: Partial<UserFilters>
}

export interface UseUserFiltersReturn {
  /**
   * Current filters
   */
  filters: UserFilters
  
  /**
   * Update filters
   */
  setFilters: React.Dispatch<React.SetStateAction<UserFilters>>
  
  /**
   * Update specific filter
   */
  updateFilter: (updated: Partial<UserFilters>) => void
  
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
  apiFilters: {
    role?: UserRole
    fromDate?: string
    toDate?: string
    search?: string
  }
}

const DEFAULT_FILTERS: UserFilters = {
  search: '',
  fromDate: '',
  toDate: '',
  role: 'all',
}

/**
 * Hook for managing user filters
 */
export function useUserFilters({
  initialFilters,
}: UseUserFiltersOptions = {}): UseUserFiltersReturn {
  const [filters, setFilters] = useState<UserFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  })

  const debouncedSearch = useDebounce(filters.search, DEFAULT_VALUES.DEBOUNCE_DELAY)

  const updateFilter = (updated: Partial<UserFilters>) => {
    setFilters((current) => ({
      ...current,
      ...updated,
    }))
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const apiFilters = useMemo(
    () => ({
      role: filters.role !== 'all' ? filters.role : undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      search: debouncedSearch || undefined,
    }),
    [filters.role, filters.fromDate, filters.toDate, debouncedSearch]
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

