/**
 * React Query Hooks Index
 * 
 * Central export point for all React Query hooks.
 * This allows importing multiple hooks from a single import.
 * 
 * Usage:
 *   import { useDocuments, useUploadDocument } from '@/hooks/api'
 *   import { useUsers, useUpdateUser } from '@/hooks/api'
 * 
 * Note: Query keys are now centralized in @/constants/queryKeys
 *   import { QUERY_KEYS } from '@/constants/queryKeys'
 */

// Re-export document hooks
export * from './useDocuments'

// Re-export user/profile hooks
export * from './useUsers'

// Re-export statistics hooks
export * from './useStats'

// Re-export download log hooks
export * from './useDownloadLogs'

// Re-export subadmin hooks
export * from './useSubadmins'

