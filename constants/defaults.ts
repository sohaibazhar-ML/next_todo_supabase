/**
 * Default Values Constants
 * 
 * This file contains all default values used throughout the application.
 * All hardcoded default values should be replaced with constants from this file.
 * 
 * Usage:
 *   import { DEFAULT_VALUES } from '@/constants/defaults'
 *   const [count, setCount] = useState(DEFAULT_VALUES.NUMBER_OF_ADULTS)
 *   setTimeout(() => {}, DEFAULT_VALUES.REFRESH_DELAY)
 */

// ============================================================================
// Numeric Defaults
// ============================================================================

/**
 * Default numeric values used throughout the application
 */
export const DEFAULT_VALUES = {
  /**
   * Default number of adults in profile
   * Used in ProfileForm, SignUpPage components
   */
  NUMBER_OF_ADULTS: 1,

  /**
   * Default number of children in profile
   * Used in ProfileForm, SignUpPage components
   */
  NUMBER_OF_CHILDREN: 0,

  /**
   * Default PDF scale (zoom level)
   * Used in DocumentEditor, PdfViewer components
   */
  PDF_SCALE: 1.0,

  /**
   * Default PDF page number
   * Used in DocumentEditor, PdfViewer components
   */
  PDF_PAGE_NUMBER: 1,

  /**
   * Content timeout (for editor content updates)
   * Used in DocumentEditor component
   */
  CONTENT_TIMEOUT: 0,

  /**
   * File size formatting constants
   * Used in DocumentCard, DocumentList components
   */
  FILE_SIZE_BASE: 1024,
  FILE_SIZE_ROUNDING: 100,
  FILE_SIZE_ZERO: 0,
  FILE_SIZE_UNITS: ['Bytes', 'KB', 'MB', 'GB'] as const,

  /**
   * Maximum file size for uploads (50MB in bytes)
   * Used in DocumentUpload component
   */
  MAX_FILE_SIZE: 50 * 1024 * 1024,

  /**
   * Text preview length (for error messages)
   * Used when displaying truncated error responses
   */
  TEXT_PREVIEW_LENGTH: 200,

  /**
   * Refresh delay in milliseconds
   * Used after successful operations before page refresh
   */
  REFRESH_DELAY: 1000,

  /**
   * Cleanup delay in milliseconds
   * Used for DOM cleanup operations (e.g., removing temporary download links)
   */
  CLEANUP_DELAY: 100,

  /**
   * Reload delay in milliseconds
   * Used before page reload after download operations
   */
  RELOAD_DELAY: 1500,

  /**
   * Debounce delay in milliseconds for search inputs
   * Used in AdminUserManagement, AdminDocumentList, DocumentSearch
   */
  DEBOUNCE_DELAY: 300,

  /**
   * Default version number
   * Used when version is not specified
   */
  DEFAULT_VERSION: '1.0',

  /**
   * Download context for logging
   * Used in download logging functionality
   */
  DOWNLOAD_CONTEXT: 'download_center',

  /**
   * Default font size in points
   * Used in document export functionality
   */
  DEFAULT_FONT_SIZE: 12,

  /**
   * Default font size in half-points (for DOCX)
   * DOCX uses half-points, so 12pt = 24 half-points
   */
  DEFAULT_FONT_SIZE_HALF_POINTS: 24,

  /**
   * Cookie max age for "keep me logged in" (1 year in seconds)
   * Used in login functionality
   */
  KEEP_LOGGED_IN_COOKIE_MAX_AGE: 60 * 60 * 24 * 365,

  // ============================================================================
  // String Defaults
  // ============================================================================

  /**
   * Default user role
   * Used when creating new profiles
   */
  DEFAULT_ROLE: 'user',

  /**
   * Default username prefix
   * Used when generating usernames from email
   */
  DEFAULT_USERNAME_PREFIX: 'user_',

  // ============================================================================
  // Boolean Defaults
  // ============================================================================

  /**
   * Default email confirmed status
   * Used when creating new profiles
   */
  DEFAULT_EMAIL_CONFIRMED: false,

  /**
   * Default keep logged in preference
   * Used in login and profile functionality
   */
  DEFAULT_KEEP_LOGGED_IN: true,

  /**
   * Default marketing consent
   * Used in ProfileForm, SignUpPage components
   */
  DEFAULT_MARKETING_CONSENT: false,

  /**
   * Default terms accepted (should be false, user must accept)
   * Used in ProfileForm, SignUpPage components
   */
  DEFAULT_TERMS_ACCEPTED: false,

  /**
   * Default data privacy accepted (should be false, user must accept)
   * Used in ProfileForm, SignUpPage components
   */
  DEFAULT_DATA_PRIVACY_ACCEPTED: false,

  /**
   * Default is featured status for documents
   * Used in DocumentUpload component
   */
  DEFAULT_IS_FEATURED: false,

  /**
   * Default is active status for subadmins
   * Used in SubadminManagement component
   */
  DEFAULT_SUBADMIN_IS_ACTIVE: true,

  // ============================================================================
  // Array Defaults
  // ============================================================================

  /**
   * Default empty tags array
   * Used in DocumentUpload component
   */
  DEFAULT_TAGS: [] as string[],

  /**
   * Default empty array for selected tags
   * Used in AdminStats component
   */
  DEFAULT_SELECTED_TAGS: [] as string[],

  // ============================================================================
  // Date/Time Defaults
  // ============================================================================

  /**
   * Default date string (empty)
   * Used in filter components
   */
  DEFAULT_DATE: '',

  // ============================================================================
  // Search/Filter Defaults
  // ============================================================================

  /**
   * Default search query (empty)
   * Used in search and filter components
   */
  DEFAULT_SEARCH_QUERY: '',

  /**
   * Default category filter (empty/all)
   * Used in filter components
   */
  DEFAULT_CATEGORY: '',

  /**
   * Default file type filter (empty/all)
   * Used in filter components
   */
  DEFAULT_FILE_TYPE: '',

  // ============================================================================
  // Pagination Defaults
  // ============================================================================

  /**
   * Default page size for search results
   * Used in document search API
   */
  DEFAULT_PAGE_SIZE: 100,

  /**
   * Default page offset
   * Used in document search API
   */
  DEFAULT_PAGE_OFFSET: 0,
  TIMEOUTS: {
    DEBOUNCE: 500,
    ANIMATION: 300,
    REDIRECT: 2000, // Added for reset password
    CLEANUP: 100,
    RELOAD: 500,
    CONTENT_UPDATE: 100, // For editor update
    ZERO: 0,
  },
  PAGINATION: {
    ITEMS_PER_PAGE: 10,
    INITIAL_PAGE: 1,
  }
} as const

/**
 * Type helper for default value keys
 */
export type DefaultValueKey = keyof typeof DEFAULT_VALUES

