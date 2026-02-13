/**
 * API Services Index
 * 
 * Central export point for all API service functions.
 * This allows importing multiple services from a single import.
 * 
 * Usage:
 *   import { fetchDocuments, uploadDocument } from '@/services/api'
 *   import { fetchUsers, updateUser } from '@/services/api'
 */

// Re-export document services
export * from './documents'

// Re-export profile/user services
export * from './profiles'
export * from './users'

// Re-export statistics services
export * from './stats'

// Re-export download log services
export * from './downloadLogs'

// Re-export subadmin services
export * from './subadmins'

