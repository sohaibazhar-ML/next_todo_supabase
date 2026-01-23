/**
 * React Query Hooks for Users/Profiles
 * 
 * Provides data fetching, caching, and mutation hooks for user profile operations.
 * Uses React Query for automatic caching, refetching, and state management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserProfile } from '@/types'
import * as profilesApi from '@/services/api/profiles'

/**
 * Query keys for user/profile-related queries
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: {
    role?: string
    fromDate?: string
    toDate?: string
    search?: string
  }) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (userId: string) => [...userKeys.details(), userId] as const,
}

/**
 * Fetch users with filters
 */
export function useUsers(filters?: {
  role?: string
  fromDate?: string
  toDate?: string
  search?: string
}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => profilesApi.fetchProfiles(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Fetch a single user profile by user ID
 */
export function useUser(userId: string | null) {
  return useQuery({
    queryKey: userKeys.detail(userId || ''),
    queryFn: () => {
      if (!userId) throw new Error('User ID is required')
      return profilesApi.fetchProfileByUserId(userId)
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Update user profile mutation
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string
      updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
    }) => profilesApi.updateProfile(userId, updates),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(userKeys.detail(variables.userId), data)
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

/**
 * Check username availability
 */
export function useCheckUsername(username: string | null) {
  return useQuery({
    queryKey: [...userKeys.all, 'checkUsername', username],
    queryFn: () => {
      if (!username) throw new Error('Username is required')
      return profilesApi.checkUsernameAvailability(username)
    },
    enabled: !!username && username.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

