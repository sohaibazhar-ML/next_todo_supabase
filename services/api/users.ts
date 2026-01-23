/**
 * Users API Service
 * 
 * Centralized service layer for user-related API calls.
 * This is an alias/re-export of profiles service for consistency.
 * 
 * Note: User management is primarily handled through the profiles API.
 * This file provides a consistent interface for user-related operations.
 */

export {
  fetchProfiles as fetchUsers,
  fetchProfileByUserId as fetchUserById,
  updateProfile as updateUser,
} from './profiles'

export type { UserProfile } from '@/types'

