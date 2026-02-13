/**
 * React Query Hooks for Download Logs
 * 
 * Provides data fetching and mutation hooks for download log operations.
 * Uses React Query for automatic caching, refetching, and state management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  DownloadLogWithDocument,
  CreateDownloadLogData,
  DownloadLogFilters,
} from '@/services/api/downloadLogs'
import * as downloadLogsApi from '@/services/api/downloadLogs'
import { QUERY_KEYS } from '@/constants/queryKeys'

/**
 * Fetch download logs with filters
 */
export function useDownloadLogs(filters?: DownloadLogFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.downloadLogs.list(filters),
    queryFn: () => downloadLogsApi.fetchDownloadLogs(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Create download log mutation
 */
export function useCreateDownloadLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDownloadLogData) =>
      downloadLogsApi.createDownloadLog(data),
    onSuccess: () => {
      // Invalidate download log lists to refetch
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.downloadLogs.lists() })
    },
  })
}

