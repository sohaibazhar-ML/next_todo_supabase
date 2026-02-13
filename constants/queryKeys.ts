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

// Base key arrays (defined first to avoid circular references)
const DOCUMENTS_BASE = ['documents'] as const
const PROFILES_BASE = ['profiles'] as const
const USERS_BASE = ['users'] as const
const ADMIN_BASE = ['admin'] as const
const DOWNLOAD_LOGS_BASE = ['downloadLogs'] as const

export const QUERY_KEYS = {
  // ============================================================================
  // Documents
  // ============================================================================
  documents: {
    all: DOCUMENTS_BASE,
    lists: () => [...DOCUMENTS_BASE, 'list'] as const,
    list: (filters?: DocumentSearchFilters) =>
      [...DOCUMENTS_BASE, 'list', filters] as const,
    details: () => [...DOCUMENTS_BASE, 'detail'] as const,
    detail: (id: string) => [...DOCUMENTS_BASE, 'detail', id] as const,
    versions: (id: string) => [...DOCUMENTS_BASE, 'detail', id, 'versions'] as const,
    filterOptions: () => [...DOCUMENTS_BASE, 'filterOptions'] as const,
    downloadUrl: (id: string) => [...DOCUMENTS_BASE, 'detail', id, 'downloadUrl'] as const,
    convert: (id: string) => [...DOCUMENTS_BASE, 'detail', id, 'convert'] as const,
    userVersions: (id: string) => [...DOCUMENTS_BASE, 'detail', id, 'userVersions'] as const,
  },

  // ============================================================================
  // Profiles
  // ============================================================================
  profiles: {
    all: PROFILES_BASE,
    lists: () => [...PROFILES_BASE, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...PROFILES_BASE, 'list', filters] as const,
    details: () => [...PROFILES_BASE, 'detail'] as const,
    detail: (id: string) => [...PROFILES_BASE, 'detail', id] as const,
    byUserId: (userId: string) => [...PROFILES_BASE, 'detail', 'user', userId] as const,
    checkUsername: (username: string) =>
      [...PROFILES_BASE, 'checkUsername', username] as const,
  },

  // ============================================================================
  // Users
  // ============================================================================
  users: {
    all: USERS_BASE,
    lists: () => [...USERS_BASE, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...USERS_BASE, 'list', filters] as const,
  },

  // ============================================================================
  // Admin
  // ============================================================================
  admin: {
    all: ADMIN_BASE,
    stats: (filters?: unknown) =>
      [...ADMIN_BASE, 'stats', filters] as const,
    dashboardStats: () => [...ADMIN_BASE, 'dashboardStats'] as const,
    subadmins: {
      all: [...ADMIN_BASE, 'subadmins'] as const,
      list: () => [...ADMIN_BASE, 'subadmins', 'list'] as const,
      detail: (id: string) => [...ADMIN_BASE, 'subadmins', 'detail', id] as const,
    },
  },

  // ============================================================================
  // Download Logs
  // ============================================================================
  downloadLogs: {
    all: DOWNLOAD_LOGS_BASE,
    lists: () => [...DOWNLOAD_LOGS_BASE, 'list'] as const,
    list: (filters?: unknown) =>
      [...DOWNLOAD_LOGS_BASE, 'list', filters] as const,
  },
} as const
