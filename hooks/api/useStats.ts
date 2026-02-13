/**
 * React Query Hooks for Statistics
 * 
 * Provides data fetching hooks for admin statistics.
 * Uses React Query for automatic caching and refetching.
 */

import { useQuery } from '@tanstack/react-query'
import type { Statistics, StatisticsFilters } from '@/services/api/stats'
import * as statsApi from '@/services/api/stats'
import { QUERY_KEYS } from '@/constants/queryKeys'

/**
 * Fetch admin statistics with filters
 */
export function useStatistics(filters?: StatisticsFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.stats(filters),
    queryFn: () => statsApi.fetchStatistics(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

