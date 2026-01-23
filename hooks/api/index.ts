/**
 * React Query Hooks Index
 * 
 * Central export point for all React Query hooks.
 * This allows importing multiple hooks from a single import.
 * 
 * Usage:
 *   import { useDocuments, useUploadDocument } from '@/hooks/api'
 *   import { useUsers, useUpdateUser } from '@/hooks/api'
 */

// Re-export document hooks
export * from './useDocuments'
export { documentKeys } from './useDocuments'

// Re-export user/profile hooks
export * from './useUsers'
export { userKeys } from './useUsers'

// Re-export statistics hooks
export * from './useStats'
export { statsKeys } from './useStats'

// Re-export download log hooks
export * from './useDownloadLogs'
export { downloadLogKeys } from './useDownloadLogs'

// Re-export subadmin hooks
export * from './useSubadmins'
export { subadminKeys } from './useSubadmins'

