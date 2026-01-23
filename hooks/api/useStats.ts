/**
 * React Query Hooks for Statistics
 * 
 * Provides data fetching hooks for admin statistics.
 * Uses React Query for automatic caching and refetching.
 */

import { useQuery } from '@tanstack/react-query'
import type { Statistics, StatisticsFilters } from '@/services/api/stats'
import * as statsApi from '@/services/api/stats'

/**
 * Query keys for statistics-related queries
 */
export const statsKeys = {
  all: ['stats'] as const,
  list: (filters?: StatisticsFilters) =>
    [...statsKeys.all, filters] as const,
}

/**
 * Fetch admin statistics with filters
 */
export function useStatistics(filters?: StatisticsFilters) {
  return useQuery({
    queryKey: statsKeys.list(filters),
    queryFn: () => statsApi.fetchStatistics(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

