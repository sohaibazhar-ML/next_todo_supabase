/**
 * Query Keys for React Query
 * 
 * Centralized query keys ensure consistent cache invalidation
 * and prevent key collisions. All query keys should be defined here.
 * 
 * Usage:
 *   import { QUERY_KEYS } from '@/constants/queryKeys'
 *   queryKey: QUERY_KEYS.documents.list(filters)
 */

import type { DocumentSearchFilters } from '@/types/document'

export const QUERY_KEYS = {
  // ============================================================================
  // Documents
  // ============================================================================
  documents: {
    all: ['documents'] as const,
    lists: () => [...QUERY_KEYS.documents.all, 'list'] as const,
    list: (filters?: DocumentSearchFilters) => 
      [...QUERY_KEYS.documents.lists(), filters] as const,
    details: () => [...QUERY_KEYS.documents.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.documents.details(), id] as const,
    versions: (id: string) => [...QUERY_KEYS.documents.detail(id), 'versions'] as const,
    filterOptions: () => [...QUERY_KEYS.documents.all, 'filterOptions'] as const,
    downloadUrl: (id: string) => [...QUERY_KEYS.documents.detail(id), 'downloadUrl'] as const,
    convert: (id: string) => [...QUERY_KEYS.documents.detail(id), 'convert'] as const,
  },
  
  // ============================================================================
  // Profiles
  // ============================================================================
  profiles: {
    all: ['profiles'] as const,
    lists: () => [...QUERY_KEYS.profiles.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...QUERY_KEYS.profiles.lists(), filters] as const,
    details: () => [...QUERY_KEYS.profiles.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.profiles.details(), id] as const,
    byUserId: (userId: string) => [...QUERY_KEYS.profiles.details(), 'user', userId] as const,
    checkUsername: (username: string) => 
      [...QUERY_KEYS.profiles.all, 'checkUsername', username] as const,
  },
  
  // ============================================================================
  // Users
  // ============================================================================
  users: {
    all: ['users'] as const,
    lists: () => [...QUERY_KEYS.users.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...QUERY_KEYS.users.lists(), filters] as const,
  },
  
  // ============================================================================
  // Admin
  // ============================================================================
  admin: {
    all: ['admin'] as const,
    stats: (filters?: Record<string, unknown>) => 
      [...QUERY_KEYS.admin.all, 'stats', filters] as const,
    dashboardStats: () => [...QUERY_KEYS.admin.all, 'dashboardStats'] as const,
    subadmins: {
      all: [...QUERY_KEYS.admin.all, 'subadmins'] as const,
      list: () => [...QUERY_KEYS.admin.subadmins.all, 'list'] as const,
      detail: (id: string) => [...QUERY_KEYS.admin.subadmins.all, 'detail', id] as const,
    },
  },
  
  // ============================================================================
  // Download Logs
  // ============================================================================
  downloadLogs: {
    all: ['downloadLogs'] as const,
    lists: () => [...QUERY_KEYS.downloadLogs.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...QUERY_KEYS.downloadLogs.lists(), filters] as const,
  },
} as const
