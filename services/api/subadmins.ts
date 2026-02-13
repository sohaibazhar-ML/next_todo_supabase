/**
 * Subadmins API Service
 * 
 * Centralized service layer for all subadmin-related API calls.
 * Provides type-safe functions for fetching, creating, updating, and deleting subadmins.
 */

import { API_ENDPOINTS } from '@/constants/api'
import type { SubadminPermissions } from '@/types'
import { ERROR_MESSAGES } from '@/constants'

/**
 * Subadmin with permissions
 */
export interface Subadmin {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  permissions: SubadminPermissions
  created_at: string | Date
  updated_at: string | Date
}

/**
 * Create subadmin data
 */
export interface CreateSubadminData {
  userId: string
  can_upload_documents: boolean
  can_view_stats: boolean
  is_active: boolean
}

/**
 * Update subadmin permissions data
 */
export interface UpdateSubadminData {
  can_upload_documents: boolean
  can_view_stats: boolean
  is_active: boolean
}

/**
 * Normalize a subadmin from API response
 */
function normalizeSubadmin(subadmin: Subadmin): Subadmin {
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
    ...subadmin,
    created_at: toISOString(subadmin.created_at),
    updated_at: toISOString(subadmin.updated_at),
  }
}

/**
 * Fetch all subadmins
 */
export async function fetchSubadmins(): Promise<Subadmin[]> {
  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_SUBADMINS)
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        ERROR_MESSAGES.FETCH_SUBADMINS

      throw new Error(errorMessage)
    }

    const subadmins: Subadmin[] = Array.isArray(data)
      ? data.map(normalizeSubadmin)
      : []

    return subadmins
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_SUBADMINS
    throw new Error(message)
  }
}

/**
 * Fetch a single subadmin by user ID
 */
export async function fetchSubadminById(userId: string): Promise<Subadmin | null> {
  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_SUBADMIN_BY_ID(userId))
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        ERROR_MESSAGES.FETCH_SUBADMIN

      throw new Error(errorMessage)
    }

    return data ? normalizeSubadmin(data) : null
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.FETCH_SUBADMIN
    throw new Error(message)
  }
}

/**
 * Create a new subadmin
 */
export async function createSubadmin(
  subadminData: CreateSubadminData
): Promise<Subadmin> {
  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_SUBADMINS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subadminData),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        ERROR_MESSAGES.CREATE_SUBADMIN

      throw new Error(errorMessage)
    }

    return normalizeSubadmin(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.CREATE_SUBADMIN
    throw new Error(message)
  }
}

/**
 * Update subadmin permissions
 */
export async function updateSubadmin(
  userId: string,
  updates: UpdateSubadminData
): Promise<Subadmin> {
  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_SUBADMIN_BY_ID(userId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        ERROR_MESSAGES.UPDATE_SUBADMIN

      throw new Error(errorMessage)
    }

    return normalizeSubadmin(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.UPDATE_SUBADMIN
    throw new Error(message)
  }
}

/**
 * Delete a subadmin (remove subadmin role)
 */
export async function deleteSubadmin(userId: string): Promise<void> {
  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_SUBADMIN_BY_ID(userId), {
      method: 'DELETE',
    })

    if (!response.ok) {
      const data = await response.json()
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        ERROR_MESSAGES.REMOVE_SUBADMIN

      throw new Error(errorMessage)
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : ERROR_MESSAGES.REMOVE_SUBADMIN
    throw new Error(message)
  }
}

