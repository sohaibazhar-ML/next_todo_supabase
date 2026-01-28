/**
 * Console Messages Constants
 * 
 * This file contains all console log/error/warn messages used throughout the application.
 * All hardcoded console messages should be replaced with constants from this file.
 * 
 * Usage:
 *   import { CONSOLE_MESSAGES } from '@/constants/console'
 *   console.error(CONSOLE_MESSAGES.ERROR_FETCHING_DOCUMENTS, err)
 *   console.log(CONSOLE_MESSAGES.PROFILE_CREATED, profileId)
 */

// ============================================================================
// Document Console Messages
// ============================================================================

/**
 * Console messages for logging, debugging, and error tracking
 */
export const CONSOLE_MESSAGES = {
  /**
   * Error fetching documents
   * Used in DocumentList, DocumentManagement components
   */
  ERROR_FETCHING_DOCUMENTS: 'Error fetching documents:',

  /**
   * Error fetching single document
   * Used in API routes
   */
  ERROR_FETCHING_DOCUMENT: 'Error fetching document:',

  /**
   * Error creating document
   * Used in DocumentUpload, API routes
   */
  ERROR_CREATING_DOCUMENT: 'Error creating document:',

  /**
   * Error updating document
   * Used in API routes
   */
  ERROR_UPDATING_DOCUMENT: 'Error updating document:',

  /**
   * Error deleting document
   * Used in API routes
   */
  ERROR_DELETING_DOCUMENT: 'Error deleting document:',

  /**
   * Error fetching versions
   * Used in DocumentCard, DocumentEditor components
   */
  ERROR_FETCHING_VERSIONS: 'Error fetching versions:',

  /**
   * Error fetching version count
   * Used in DocumentCard component
   */
  ERROR_FETCHING_VERSION_COUNT: 'Error fetching version count:',

  /**
   * Error fetching download count
   * Used in DocumentCard component
   */
  ERROR_FETCHING_DOWNLOAD_COUNT: 'Error fetching download count:',

  /**
   * Error logging download
   * Used in DocumentCard component
   */
  ERROR_LOGGING_DOWNLOAD: 'Error logging download:',

  /**
   * Error fetching download logs
   * Used in API routes
   */
  ERROR_FETCHING_DOWNLOAD_LOGS: 'Error fetching download logs:',

  /**
   * Error creating download log
   * Used in API routes
   */
  ERROR_CREATING_DOWNLOAD_LOG: 'Error creating download log:',

  /**
   * Error generating download URL
   * Used in API routes
   */
  ERROR_GENERATING_DOWNLOAD_URL: 'Error generating download URL:',

  /**
   * Error checking username
   * Used in API routes
   */
  ERROR_CHECKING_USERNAME: 'Error checking username:',

  /**
   * Error fetching filter options
   * Used in DocumentList component
   */
  ERROR_FETCHING_FILTER_OPTIONS: 'Error fetching filter options:',

  /**
   * Error deleting file from storage
   * Used in DocumentManagement component
   */
  ERROR_DELETING_FILE: 'Error deleting file from storage:',

  /**
   * Delete error
   * Used in DocumentManagement component
   */
  DELETE_ERROR: 'Delete error:',

  /**
   * Update error
   * Used in DocumentManagement component
   */
  UPDATE_ERROR: 'Update error:',

  /**
   * Upload error
   * Used in DocumentUpload component
   */
  UPLOAD_ERROR: 'Upload error:',

  /**
   * Storage upload error
   * Used in documents upload API route
   */
  STORAGE_UPLOAD_ERROR: 'Storage upload error:',

  /**
   * Storage download error
   * Used in documents convert API route
   */
  STORAGE_DOWNLOAD_ERROR: 'Storage download error:',

  /**
   * Mammoth conversion error
   * Used in documents convert API route
   */
  MAMMOTH_CONVERSION_ERROR: 'Mammoth conversion error:',

  /**
   * Mammoth fallback error
   * Used in documents convert API route
   */
  MAMMOTH_FALLBACK_ERROR: 'Mammoth fallback error:',

  /**
   * PDF processing error
   * Used in documents convert API route
   */
  PDF_PROCESSING_ERROR: 'PDF processing error:',

  /**
   * Error converting document
   * Used in documents convert API route
   */
  ERROR_CONVERTING_DOCUMENT: 'Error converting document:',

  /**
   * HTML to DOCX conversion error
   * Used in documents export API route
   */
  HTML_TO_DOCX_CONVERSION_ERROR: 'HTML to DOCX conversion error:',

  /**
   * PDF creation error
   * Used in documents export API route
   */
  PDF_CREATION_ERROR: 'PDF creation error:',

  /**
   * Error exporting document
   * Used in documents export API route
   */
  ERROR_EXPORTING_DOCUMENT: 'Error exporting document:',

  /**
   * No file data returned
   * Used in documents convert API route
   */
  NO_FILE_DATA: 'No file data returned for path:',

  // ============================================================================
  // Document Editor Console Messages
  // ============================================================================

  /**
   * Error loading versions in editor
   * Used in DocumentEditor component
   */
  ERROR_LOADING_VERSIONS: 'Error loading versions:',

  /**
   * Error saving edited document
   * Used in API routes
   */
  ERROR_SAVING_EDITED_DOCUMENT: 'Error saving edited document:',

  /**
   * Error loading annotations
   * Used in DocumentEditor component
   */
  ERROR_LOADING_ANNOTATIONS: 'Error loading annotations:',

  /**
   * Search error
   * Used in DocumentEditor component
   */
  SEARCH_ERROR: 'Search error:',

  /**
   * PDF load error
   * Used in PdfViewer component
   */
  PDF_LOAD_ERROR: 'PDF load error:',

  /**
   * Non-JSON response
   * Used when API returns non-JSON response
   */
  NON_JSON_RESPONSE: 'Non-JSON response:',

  /**
   * Error extracting text
   * Used in DocumentEditor component
   */
  ERROR_EXTRACTING_TEXT: 'Error extracting text:',

  /**
   * PDF.js worker loaded successfully
   * Used in DocumentEditor component
   */
  PDF_WORKER_LOADED: 'PDF.js worker loaded successfully:',

  /**
   * Failed to load worker from
   * Used in DocumentEditor component
   */
  PDF_WORKER_FAILED: 'Failed to load worker from',

  /**
   * PDF.js worker loaded from .js
   * Used in DocumentEditor component (fallback)
   */
  PDF_WORKER_LOADED_JS: 'PDF.js worker loaded from .js:',

  /**
   * Failed to load worker from .js
   * Used in DocumentEditor component (fallback error)
   */
  PDF_WORKER_FAILED_JS: 'Failed to load worker from .js:',

  // ============================================================================
  // Statistics Console Messages
  // ============================================================================

  /**
   * Error fetching stats
   * Used in AdminStats component
   */
  ERROR_FETCHING_STATS: 'Error fetching stats:',

  /**
   * Error fetching admin stats
   * Used in admin stats API route
   */
  ERROR_FETCHING_ADMIN_STATS: 'Error fetching admin stats:',

  // ============================================================================
  // Profile Console Messages
  // ============================================================================

  /**
   * Error fetching profile
   * Used in profiles API route
   */
  ERROR_FETCHING_PROFILE: 'Error fetching profile:',

  /**
   * Error updating profile
   * Used in ProfileForm component and profiles API route
   */
  ERROR_UPDATING_PROFILE: 'Error updating profile:',

  /**
   * Error creating profile
   * Used in profiles API route
   */
  ERROR_CREATING_PROFILE: 'Error creating profile:',

  /**
   * Profile creation with different authenticated user
   * Used in profiles API route (warning)
   */
  PROFILE_CREATION_STALE_SESSION:
    'Profile creation with different authenticated user (likely signup with stale session):',

  /**
   * Creating profile
   * Used in profiles API route (info log)
   */
  CREATING_PROFILE: 'Creating profile:',

  /**
   * Profile created successfully
   * Used in profiles API route (info log)
   */
  PROFILE_CREATED: 'Profile created successfully:',

  // ============================================================================
  // Subadmin Console Messages
  // ============================================================================

  /**
   * Error fetching subadmins
   * Used in SubadminManagement component and subadmins API route
   */
  ERROR_FETCHING_SUBADMINS: 'Error fetching subadmins:',

  /**
   * Error fetching subadmin
   * Used in subadmins API route
   */
  ERROR_FETCHING_SUBADMIN: 'Error fetching subadmin:',

  /**
   * Error saving subadmin
   * Used in SubadminManagement component
   */
  ERROR_SAVING_SUBADMIN: 'Error saving subadmin:',

  /**
   * Error creating subadmin
   * Used in subadmins API route
   */
  ERROR_CREATING_SUBADMIN: 'Error creating subadmin:',

  /**
   * Error syncing download counts
   * Used in admin sync-download-counts API route
   */
  ERROR_SYNCING_DOWNLOAD_COUNTS: 'Error syncing download counts:',

  /**
   * Error removing subadmin
   * Used in SubadminManagement component
   */
  ERROR_REMOVING_SUBADMIN: 'Error removing subadmin:',

  /**
   * Error updating subadmin
   * Used in SubadminManagement component and subadmins API route
   */
  ERROR_UPDATING_SUBADMIN: 'Error updating subadmin:',

  /**
   * Error fetching users
   * Used in SubadminManagement component
   */
  ERROR_FETCHING_USERS: 'Error fetching users:',

  /**
   * Action completed logs
   */
  UPLOAD_COMPLETE: 'Uploaded:',
  UPDATE_COMPLETE: 'Updated!',

  /**
   * Error modifying session cookies
   * Used in middleware
   */
  ERROR_MODIFYING_SESSION_COOKIES: 'Error modifying session cookies:',

  /**
   * Error exchanging code for session
   * Used in auth callback
   */
  ERROR_SESSION_EXCHANGE: 'Error exchanging code for session:',

  /**
   * Error syncing document
   * Used in sync-download-counts API
   */
  ERROR_SYNCING_DOCUMENT: 'Error syncing document:',

  /**
   * Error toggling subadmin status
   * Used in SubadminManagement component
   */
  ERROR_TOGGLING_SUBADMIN_STATUS: 'Error toggling subadmin active status:',
} as const

/**
 * Type helper for console message keys
 */
export type ConsoleMessageKey = keyof typeof CONSOLE_MESSAGES

