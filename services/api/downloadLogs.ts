/**
 * Download Logs API Service
 * 
 * Centralized service layer for all download log-related API calls.
 * Provides type-safe functions for fetching and creating download logs.
 */

import { API_ENDPOINTS } from '@/constants/api'
import type { DownloadLog } from '@/types'
import { ERROR_MESSAGES } from '@/constants'

/**
 * Download log filters
 */
export interface DownloadLogFilters {
  documentId?: string
  userId?: string
  fromDate?: string
  toDate?: string
}

/**
 * Create download log data
 */
export interface CreateDownloadLogData {
  document_id: string
  user_id: string
  context?: string
  metadata?: Record<string, unknown>
}

/**
 * Download log with document info (from API response)
 */
export interface DownloadLogWithDocument extends DownloadLog {
  documents?: {
    id: string
    title: string
    file_name: string
  }
}

/**
 * Normalize a download log from API response
 */
function normalizeDownloadLog(log: DownloadLogWithDocument): DownloadLogWithDocument {
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
    ...log,
    downloaded_at: toISOString(log.downloaded_at),
  }
}

/**
 * Fetch download logs with optional filters
 */
export async function fetchDownloadLogs(
  filters?: DownloadLogFilters
): Promise<DownloadLogWithDocument[]> {
  try {
    const params = new URLSearchParams()

    if (filters?.documentId) {
      params.append('documentId', filters.documentId)
    }
    if (filters?.userId) {
      params.append('userId', filters.userId)
    }
    if (filters?.fromDate) {
      params.append('fromDate', filters.fromDate)
    }
    if (filters?.toDate) {
      params.append('toDate', filters.toDate)
    }

    const response = await fetch(
      `${API_ENDPOINTS.DOWNLOAD_LOGS}?${params.toString()}`
    )
    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to fetch download logs'

      throw new Error(errorMessage)
    }

    const logs: DownloadLogWithDocument[] = Array.isArray(data)
      ? data.map(normalizeDownloadLog)
      : []

    return logs
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch download logs'
    throw new Error(message)
  }
}

/**
 * Create a download log entry
 */
export async function createDownloadLog(
  logData: CreateDownloadLogData
): Promise<DownloadLog> {
  try {
    const response = await fetch(API_ENDPOINTS.DOWNLOAD_LOGS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        (typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof data.error === 'string' &&
          data.error) ||
        'Failed to create download log'

      throw new Error(errorMessage)
    }

    return normalizeDownloadLog(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create download log'
    throw new Error(message)
  }
}

