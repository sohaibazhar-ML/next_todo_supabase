/**
 * API Endpoints Constants
 * 
 * This file contains all API endpoint paths used throughout the application.
 * All hardcoded API URLs should be replaced with constants from this file.
 * 
 * Usage:
 *   import { API_ENDPOINTS } from '@/constants/api'
 *   fetch(API_ENDPOINTS.DOCUMENTS)
 *   fetch(API_ENDPOINTS.DOCUMENT_BY_ID('123'))
 */

// ============================================================================
// Documents API Endpoints
// ============================================================================

/**
 * Documents API endpoints
 * Base paths and document-specific routes
 */
export const API_ENDPOINTS = {
  /**
   * Base documents endpoint
   * GET: Fetch all documents with optional filters
   * POST: Create a new document (via upload endpoint)
   */
  DOCUMENTS: '/api/documents',

  /**
   * Get a specific document by ID
   * @param id - Document ID
   * GET: Fetch document details
   * PUT: Update document
   * DELETE: Delete document
   */
  DOCUMENT_BY_ID: (id: string) => `/api/documents/${id}`,

  /**
   * Get document versions
   * @param id - Document ID
   * GET: Fetch all versions of a document
   */
  DOCUMENT_VERSIONS: (id: string) => `/api/documents/${id}/versions`,

  /**
   * Get document download URL
   * @param id - Document ID
   * GET: Get signed download URL for a document
   */
  DOCUMENT_DOWNLOAD_URL: (id: string) => `/api/documents/${id}/download-url`,

  /**
   * Convert document (for editor)
   * @param id - Document ID
   * GET: Convert document to editable format (HTML for DOCX, PDF URL for PDF)
   */
  DOCUMENT_CONVERT: (id: string) => `/api/documents/${id}/convert`,

  /**
   * Edit document (save version)
   * @param id - Document ID
   * POST: Save a new version of an edited document
   */
  DOCUMENT_EDIT: (id: string) => `/api/documents/${id}/edit`,

  /**
   * Export document
   * @param id - Document ID
   * POST: Export document to DOCX or PDF format
   */
  DOCUMENT_EXPORT: (id: string) => `/api/documents/${id}/export`,

  /**
   * Upload document
   * POST: Upload a new document or document version
   */
  DOCUMENT_UPLOAD: '/api/documents/upload',

  /**
   * Get document filter options
   * GET: Fetch available categories, file types, and tags for filtering
   */
  DOCUMENT_FILTER_OPTIONS: '/api/documents/filter-options',

  // ============================================================================
  // Profiles API Endpoints
  // ============================================================================

  /**
   * Base profiles endpoint
   * GET: Fetch profile(s) - supports ?userId= query param
   * POST: Create a new profile
   * PUT: Update a profile
   */
  PROFILES: '/api/profiles',

  /**
   * Get profile by user ID
   * @param userId - User ID
   * GET: Fetch profile for a specific user
   */
  PROFILE_BY_USER_ID: (userId: string) => `/api/profiles?userId=${userId}`,

  /**
   * Check if username exists
   * @param username - Username to check
   * GET: Check username availability
   */
  PROFILE_CHECK_USERNAME: (username: string) =>
    `/api/profiles/check-username?username=${encodeURIComponent(username)}`,

  // ============================================================================
  // Admin API Endpoints
  // ============================================================================

  /**
   * Admin statistics endpoint
   * GET: Fetch admin statistics with optional filters (fromDate, toDate, search, category, tags)
   */
  ADMIN_STATS: '/api/admin/stats',

  /**
   * Base subadmins endpoint
   * GET: Fetch all subadmins
   * POST: Create a new subadmin
   */
  ADMIN_SUBADMINS: '/api/admin/subadmins',

  /**
   * Get/Update/Delete subadmin by ID
   * @param id - Subadmin user ID
   * GET: Fetch subadmin details
   * PUT: Update subadmin permissions
   * DELETE: Remove subadmin
   */
  ADMIN_SUBADMIN_BY_ID: (id: string) => `/api/admin/subadmins/${id}`,

  /**
   * Sync download counts
   * POST: Synchronize download counts between documents and download_logs
   */
  ADMIN_SYNC_DOWNLOAD_COUNTS: '/api/admin/sync-download-counts',

  // ============================================================================
  // Download Logs API Endpoints
  // ============================================================================

  /**
   * Download logs endpoint
   * GET: Fetch download logs with optional filters (documentId, userId, fromDate, toDate)
   * POST: Create a new download log entry
   */
  DOWNLOAD_LOGS: '/api/download-logs',
} as const

/**
 * Type helper for API endpoint functions
 */
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS]

