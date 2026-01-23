/**
 * Profiles API Service
 * 
 * Centralized service layer for all profile-related API calls.
 * Provides type-safe functions for fetching, creating, and updating user profiles.
 */

import { API_ENDPOINTS } from '@/constants/api'
import type { UserProfile } from '@/types'
import { ERROR_MESSAGES } from '@/constants'

/**
 * Normalize a profile from API response
 * Ensures dates are strings and all fields are properly typed
 */
function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    created_at:
      typeof profile.created_at === 'string'
        ? profile.created_at
        : new Date(profile.created_at).toISOString(),
    updated_at:
      typeof profile.updated_at === 'string'
        ? profile.updated_at
        : new Date(profile.updated_at).toISOString(),
  }
}

/**
 * Fetch profiles with optional filters
 */
export async function fetchProfiles(filters?: {
  userId?: string
  role?: string
  fromDate?: string
  toDate?: string
  search?: string
}): Promise<UserProfile[]> {
  try {
    const params = new URLSearchParams()

    if (filters?.userId) {
      params.append('userId', filters.userId)
    }
    if (filters?.role && filters.role !== 'all') {
      params.append('role', filters.role)
    }
    if (filters?.fromDate) {
      params.append('fromDate', filters.fromDate)
    }
    if (filters?.toDate) {
      params.append('toDate', filters.toDate)
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }

    const response = await fetch(
      `${API_ENDPOINTS.PROFILES}?${params.toString()}`
    )
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        ERROR_MESSAGES.FETCH_PROFILES

      throw new Error(errorMessage)
    }

    const profiles: UserProfile[] = Array.isArray(data)
      ? data.map(normalizeProfile)
      : []

    return profiles
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_PROFILES
    throw new Error(message)
  }
}

/**
 * Fetch a single profile by user ID
 */
export async function fetchProfileByUserId(
  userId: string
): Promise<UserProfile | null> {
  try {
    const response = await fetch(API_ENDPOINTS.PROFILE_BY_USER_ID(userId))
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        ERROR_MESSAGES.FETCH_PROFILES

      throw new Error(errorMessage)
    }

    return data ? normalizeProfile(data) : null
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_PROFILES
    throw new Error(message)
  }
}

/**
 * Update a profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile> {
  try {
    const response = await fetch(API_ENDPOINTS.PROFILES, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...updates,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to update profile'

      throw new Error(errorMessage)
    }

    return normalizeProfile(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to update profile'
    throw new Error(message)
  }
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailability(
  username: string
): Promise<boolean> {
  try {
    const response = await fetch(
      API_ENDPOINTS.PROFILE_CHECK_USERNAME(username)
    )
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to check username availability'

      throw new Error(errorMessage)
    }

    return typeof data.available === 'boolean' ? data.available : false
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to check username availability'
    throw new Error(message)
  }
}

