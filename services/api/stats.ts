/**
 * Statistics API Service
 * 
 * Centralized service layer for admin statistics API calls.
 * Provides type-safe functions for fetching statistics with filters.
 */

import { API_ENDPOINTS } from '@/constants/api'
import { ERROR_MESSAGES } from '@/constants'

/**
 * Statistics data structure (matches API response)
 */
export interface Statistics {
  summary: {
    totalUsers: number
    totalAdmins: number
    totalDocuments: number
  }
  downloadsPerDocument: Array<{
    id: string
    title: string
    file_name: string
    category: string
    total_downloads: number
    filtered_downloads: number
    download_logs?: Array<{
      id: string
      user_id: string
      downloaded_at: string | null
    }>
  }>
  versionDownloads: Array<{
    id: string
    version_number: number
    version_name: string | null
    document_id: string
    document_title: string
    document_file_name: string
    exported_file_path: string | null
    exported_file_size: string | null
    created_at: string
  }>
  userVersionsCount: Array<{
    user_id: string
    email: string
    name: string
    username: string
    versions_count: number
  }>
  userDocumentDownloads: Array<{
    id: string
    user_email: string
    user_name: string
    document_title: string
    document_file_name: string
    document_category: string
    downloaded_at: string | null
  }>
  filterOptions: {
    categories: string[]
    tags: string[]
  }
}

/**
 * Statistics filters
 */
export interface StatisticsFilters {
  fromDate?: string
  toDate?: string
  search?: string
  category?: string
  tags?: string[]
}

/**
 * Fetch admin statistics with optional filters
 */
export async function fetchStatistics(
  filters?: StatisticsFilters
): Promise<Statistics> {
  try {
    const params = new URLSearchParams()

    if (filters?.fromDate) {
      params.append('fromDate', filters.fromDate)
    }
    if (filters?.toDate) {
      params.append('toDate', filters.toDate)
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }
    if (filters?.category) {
      params.append('category', filters.category)
    }
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','))
    }

    const response = await fetch(
      `${API_ENDPOINTS.ADMIN_STATS}?${params.toString()}`
    )
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        ERROR_MESSAGES.FETCH_STATISTICS

      throw new Error(errorMessage)
    }

    return data as Statistics
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : ERROR_MESSAGES.FETCH_STATISTICS
    throw new Error(message)
  }
}

