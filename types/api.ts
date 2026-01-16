/**
 * API Response Types and Error Handling
 * 
 * This file contains type definitions for API responses and error handling.
 * All API-related types should be defined here to ensure type safety.
 * 
 * Usage:
 *   import { ApiError, ApiResponse, isErrorWithMessage } from '@/types/api'
 *   const response: ApiResponse<Document[]> = await fetchData()
 *   if (isErrorWithMessage(error)) { ... }
 */

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API error response structure
 * Used when API returns an error
 */
export interface ApiError {
  /**
   * Error message describing what went wrong
   */
  error: string
}

/**
 * Generic API response wrapper
 * @template T - The type of data returned on success
 */
export interface ApiResponse<T> {
  /**
   * Response data (present on success)
   */
  data?: T

  /**
   * Error message (present on failure)
   */
  error?: string
}

/**
 * API response with status information
 * @template T - The type of data returned on success
 */
export interface ApiResponseWithStatus<T> extends ApiResponse<T> {
  /**
   * HTTP status code
   */
  status: number

  /**
   * Whether the request was successful
   */
  ok: boolean
}

// ============================================================================
// Error Handling Types
// ============================================================================

/**
 * Error object with a message property
 * Used for type-safe error handling
 */
export interface ErrorWithMessage {
  /**
   * Error message
   */
  message: string
}

/**
 * Type guard to check if an error has a message property
 * 
 * @param error - Unknown error object to check
 * @returns True if error has a message property of type string
 * 
 * @example
 * ```typescript
 * try {
 *   // some operation
 * } catch (err) {
 *   if (isErrorWithMessage(err)) {
 *     console.error(err.message)
 *   }
 * }
 * ```
 */
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

/**
 * Extended error with additional properties
 * Used for more detailed error information
 */
export interface ExtendedError extends ErrorWithMessage {
  /**
   * Error code (optional)
   */
  code?: string

  /**
   * HTTP status code (optional)
   */
  statusCode?: number

  /**
   * Additional error details (optional)
   */
  details?: Record<string, unknown>
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Standard API request options
 * Extends Fetch API RequestInit with common defaults
 */
export interface ApiRequestOptions extends RequestInit {
  /**
   * Request timeout in milliseconds
   */
  timeout?: number

  /**
   * Whether to include credentials
   */
  credentials?: RequestCredentials
}

/**
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  /**
   * Page number (1-indexed)
   */
  page?: number

  /**
   * Number of items per page
   */
  limit?: number

  /**
   * Offset for pagination
   */
  offset?: number
}

/**
 * Sort parameters for API requests
 */
export interface SortParams {
  /**
   * Field to sort by
   */
  sortBy?: string

  /**
   * Sort direction
   */
  sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Date range filter
 * Used for filtering by date ranges
 */
export interface DateRangeFilter {
  /**
   * Start date (inclusive)
   */
  fromDate?: string | Date

  /**
   * End date (inclusive)
   */
  toDate?: string | Date
}

/**
 * Search filter
 * Used for text-based searches
 */
export interface SearchFilter {
  /**
   * Search query string
   */
  search?: string
}

/**
 * Type helper for API endpoint response types
 */
export type ApiEndpointResponse<T> = Promise<ApiResponse<T>>

