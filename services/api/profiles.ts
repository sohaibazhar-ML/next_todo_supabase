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
  // Helper to safely convert date to ISO string
  const toISOString = (date: string | Date | null | undefined): string => {
    if (!date) {
      return new Date().toISOString() // Default to current date if missing
    }
    if (typeof date === 'string') {
      return date
    }
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return new Date().toISOString() // Invalid date, use current date
      }
      return dateObj.toISOString()
    } catch {
      return new Date().toISOString() // Fallback to current date
    }
  }

  return {
    ...profile,
    created_at: toISOString(profile.created_at),
    updated_at: toISOString(profile.updated_at),
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
        id: userId,
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
        ERROR_MESSAGES.UPDATE_PROFILE

      throw new Error(errorMessage)
    }

    return normalizeProfile(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.UPDATE_PROFILE
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
        ERROR_MESSAGES.CHECK_USERNAME_FAILED

      throw new Error(errorMessage)
    }

    return typeof data.available === 'boolean' ? data.available : false
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : ERROR_MESSAGES.CHECK_USERNAME_FAILED
    throw new Error(message)
  }
}

/**
 * Create a new profile record
 * Used by signup and profile-completion flows.
 */
export interface CreateProfileRequest {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  current_address: string
  country_of_origin: string
  new_address_switzerland: string
  number_of_adults: number
  number_of_children: number
  pets_type: string | null
  marketing_consent: boolean
  terms_accepted: boolean
  data_privacy_accepted: boolean
  email_confirmed: boolean
  email_confirmed_at?: string
  role?: UserProfile['role']
  keep_me_logged_in?: boolean
}

export async function createProfile(
  payload: CreateProfileRequest
): Promise<UserProfile> {
  try {
    const response = await fetch(API_ENDPOINTS.PROFILES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMessage =
        (data &&
          typeof data === 'object' &&
          'error' in data &&
          typeof (data as { error?: string }).error === 'string' &&
          (data as { error?: string }).error) ||
        ERROR_MESSAGES.CREATE_PROFILE

      throw new Error(errorMessage)
    }

    return normalizeProfile(data as UserProfile)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.CREATE_PROFILE
    throw new Error(message)
  }
}

