/**
 * React Query Hooks for Subadmins
 * 
 * Provides data fetching, caching, and mutation hooks for subadmin operations.
 * Uses React Query for automatic caching, refetching, and state management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Subadmin,
  CreateSubadminData,
  UpdateSubadminData,
} from '@/services/api/subadmins'
import * as subadminsApi from '@/services/api/subadmins'

/**
 * Query keys for subadmin-related queries
 */
export const subadminKeys = {
  all: ['subadmins'] as const,
  lists: () => [...subadminKeys.all, 'list'] as const,
  details: () => [...subadminKeys.all, 'detail'] as const,
  detail: (userId: string) => [...subadminKeys.details(), userId] as const,
}

/**
 * Fetch all subadmins
 */
export function useSubadmins() {
  return useQuery({
    queryKey: subadminKeys.lists(),
    queryFn: () => subadminsApi.fetchSubadmins(),
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Fetch a single subadmin by user ID
 */
export function useSubadmin(userId: string | null) {
  return useQuery({
    queryKey: subadminKeys.detail(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID is required')
      return subadminsApi.fetchSubadminById(userId)
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Create subadmin mutation
 */
export function useCreateSubadmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSubadminData) =>
      subadminsApi.createSubadmin(data),
    onSuccess: () => {
      // Invalidate subadmin lists to refetch
      queryClient.invalidateQueries({ queryKey: subadminKeys.lists() })
    },
  })
}

/**
 * Update subadmin mutation
 */
export function useUpdateSubadmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string
      updates: UpdateSubadminData
    }) => subadminsApi.updateSubadmin(userId, updates),
    onSuccess: (data, variables) => {
      // Update the specific subadmin in cache
      queryClient.setQueryData(subadminKeys.detail(variables.userId), data)
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: subadminKeys.lists() })
    },
  })
}

/**
 * Delete subadmin mutation
 */
export function useDeleteSubadmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => subadminsApi.deleteSubadmin(userId),
    onSuccess: (_, userId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: subadminKeys.detail(userId) })
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: subadminKeys.lists() })
    },
  })
}

