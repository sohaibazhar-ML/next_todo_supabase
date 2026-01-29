/**
 * Error Messages Constants
 * 
 * This file contains all user-facing error messages used throughout the application.
 * All hardcoded error strings should be replaced with constants from this file.
 * 
 * Usage:
 *   import { ERROR_MESSAGES } from '@/constants/errors'
 *   throw new Error(ERROR_MESSAGES.FETCH_DOCUMENTS)
 *   setError(ERROR_MESSAGES.UPLOAD_DOCUMENT)
 */

// ============================================================================
// Generic Error Messages
// ============================================================================

/**
 * Generic error messages for common operations
 */
export const ERROR_MESSAGES = {
  /**
   * Generic fetch failure
   * Used when a general API request fails
   */
  FETCH_FAILED: 'Failed to fetch',

  /**
   * Generic save failure
   * Used when saving data fails
   */
  SAVE_FAILED: 'Failed to save',

  /**
   * Generic delete failure
   * Used when deleting data fails
   */
  DELETE_FAILED: 'Failed to delete',

  /**
   * Generic update failure
   * Used when updating data fails
   */
  UPDATE_FAILED: 'Failed to update',

  /**
   * Generic load failure
   * Used when loading data fails
   */
  LOAD_FAILED: 'Failed to load',

  /**
   * Network error
   * Used when network request fails
   */
  NETWORK_ERROR: 'Network error',

  /**
   * Internal server error
   * Used as a fallback error message
   */
  INTERNAL_SERVER_ERROR: 'Internal server error',

  /**
   * Invalid response from server
   * Used when server returns unexpected response format
   */
  INVALID_RESPONSE: 'Server returned an invalid response. Please try again.',

  /**
   * Invalid response format
   */
  INVALID_RESPONSE_FORMAT: 'Invalid response format',

  /**
   * Unauthorized access
   */
  UNAUTHORIZED: 'Unauthorized',

  /**
   * Forbidden access
   */
  FORBIDDEN: 'Forbidden',

  /**
   * Missing required fields
   */
  MISSING_REQUIRED_FIELDS: 'Missing required fields',

  /**
   * Invalid format
   */
  INVALID_FORMAT: 'Invalid format',

  // ============================================================================
  // Document Error Messages
  // ============================================================================

  /**
   * Failed to fetch documents list
   * Used in DocumentList, DocumentManagement components
   */
  FETCH_DOCUMENTS: 'Failed to fetch documents',

  /**
   * Failed to fetch document versions
   * Used in DocumentCard, DocumentEditor components
   */
  FETCH_VERSIONS: 'Failed to fetch versions',

  /**
   * Failed to fetch document versions (alternative message)
   * Used in DocumentCard component
   */
  FETCH_VERSIONS_FAILED: 'Failed to fetch versions',

  /**
   * Document not found
   */
  DOCUMENT_NOT_FOUND: 'Document not found',

  /**
   * User not found
   */
  USER_NOT_FOUND: 'User not found',

  /**
   * Permission required: upload documents
   */
  PERMISSION_REQUIRED_UPLOAD_DOCUMENTS: 'Permission required: can_upload_documents',

  /**
   * Parent document not found
   */
  PARENT_DOCUMENT_NOT_FOUND: 'Parent document not found',

  /**
   * Version ID required
   */
  VERSION_ID_REQUIRED: 'Version ID is required. Please save your document first.',

  /**
   * Version not found
   */
  VERSION_NOT_FOUND: 'Version not found. Please save your document first.',

  /**
   * Invalid export format
   */
  INVALID_EXPORT_FORMAT: 'Invalid export format',

  /**
   * No editable content found
   */
  NO_EDITABLE_CONTENT: 'No editable content found for this version',

  /**
   * Invalid document ID
   */
  INVALID_DOCUMENT_ID: 'Invalid document ID',

  /**
   * Document ID required
   */
  DOCUMENT_ID_REQUIRED: 'Document ID is required',

  /**
   * File not found in storage
   */
  FILE_NOT_FOUND_IN_STORAGE: 'File not found in storage',

  /**
   * Legacy .doc format not supported
   */
  LEGACY_DOC_FORMAT_NOT_SUPPORTED: 'Legacy .doc format is not supported. Please convert the file to .docx format to edit it.',

  /**
   * Unsupported file type
   */
  UNSUPPORTED_FILE_TYPE: 'Unsupported file type for editing',

  /**
   * Username required
   */
  USERNAME_REQUIRED: 'Username is required',

  /**
   * Admin access required
   */
  ADMIN_ACCESS_REQUIRED: 'Admin access required',

  /**
   * Permission required: view stats
   */
  PERMISSION_REQUIRED_VIEW_STATS: 'Permission required: can_view_stats',

  /**
   * User ID required
   */
  USER_ID_REQUIRED: 'userId is required',

  /**
   * Cannot assign subadmin role to admin
   */
  CANNOT_ASSIGN_SUBADMIN_TO_ADMIN: 'Cannot assign subadmin role to an admin',

  /**
   * User is not a subadmin
   */
  USER_NOT_SUBADMIN: 'User is not a subadmin',

  /**
   * Failed to load version information
   * Used in DocumentCard component
   */

  /**
   * Failed to load version information
   * Used in DocumentCard component
   */
  LOAD_VERSION_INFO_FAILED: 'Failed to load version information',

  /**
   * Failed to fetch download count
   * Used in DocumentCard component
   */
  FETCH_DOWNLOAD_COUNT: 'Failed to fetch download count',

  /**
   * Failed to delete document
   * Used in DocumentManagement component
   */
  DELETE_DOCUMENT: 'Failed to delete document',

  /**
   * Failed to upload document
   * Used in DocumentUpload component
   */
  UPLOAD_DOCUMENT: 'Failed to upload document',

  /**
   * Failed to update document
   * Used in DocumentManagement, DocumentEditModal components
   */
  UPDATE_DOCUMENT: 'Failed to update document',

  /**
   * Failed to load document
   * Used in DocumentEditor component
   */
  LOAD_DOCUMENT: 'Failed to load document',

  /**
   * Failed to load version information
   * Used in DocumentCard component
   */
  LOAD_VERSION_INFO: 'Failed to load version information',

  /**
   * Failed to generate download URL
   * Used in DocumentCard component
   */
  GENERATE_DOWNLOAD_URL_FAILED: 'Failed to generate download URL',

  /**
   * Failed to load version
   * Used in DocumentEditor component when loading a specific version
   */
  LOAD_VERSION: 'Failed to load version',

  /**
   * Failed to save document version
   * Used in DocumentEditor component
   */
  SAVE_DOCUMENT: 'Failed to save document',

  /**
   * Failed to export document
   * Used in DocumentEditor component
   */
  EXPORT_DOCUMENT: 'Failed to export document',

  /**
   * Failed to convert document
   * Used in documents convert API route
   */
  CONVERT_DOCUMENT_FAILED: 'Failed to convert document',

  /**
   * Failed to process PDF
   * Used in documents convert API route
   */
  PDF_PROCESSING_FAILED: 'Failed to process PDF',

  /**
   * Failed to convert HTML to DOCX
   * Used in documents export API route
   */
  HTML_TO_DOCX_CONVERSION_FAILED: 'Failed to convert HTML to DOCX',

  /**
   * Failed to create PDF
   * Used in documents export API route
   */
  PDF_CREATION_FAILED: 'Failed to create PDF',

  /**
   * Failed to download document
   * Used in DocumentCard component
   */
  DOWNLOAD_DOCUMENT: 'Failed to download document',

  /**
   * No document selected for download
   * Used in DocumentCard component
   */
  NO_DOCUMENT_SELECTED: 'No document selected. Please select a version and try again.',

  /**
   * Invalid document selected
   * Used in DocumentCard component
   */
  INVALID_DOCUMENT_SELECTED: 'Invalid document selected. Please try again.',

  /**
   * Invalid document ID format
   * Used in DocumentCard component
   */
  /**
   * Invalid document ID format
   * Used in DocumentCard component
   */
  INVALID_DOCUMENT_ID_FORMAT: 'Invalid document ID format',

  /**
   * User must be logged in to download
   * Used in DocumentCard component
   */
  MUST_BE_LOGGED_IN: 'You must be logged in to download documents',

  /**
   * Failed to fetch file for download
   * Used in DocumentCard component
   */
  FAILED_TO_FETCH_FILE: 'Failed to fetch file',

  /**
   * Download popup was blocked
   * Used in DocumentCard component
   */
  DOWNLOAD_POPUP_BLOCKED: 'Download failed and popup was blocked.',

  /**
   * Failed to fetch documents (generic)
   * Used in DocumentManagement component
   */
  FETCH_DOCUMENTS_GENERIC: 'Failed to fetch documents',

  /**
   * Failed to fetch users (generic)
   * Used in UserList component
   */
  FETCH_USERS_GENERIC: 'Failed to fetch users',

  /**
   * Invalid file type message
   * Used in document upload schema validation
   */
  INVALID_FILE_TYPE: 'Invalid file type. Please upload PDF, DOCX, XLSX, or ZIP files only.',

  /**
   * Failed to save subadmin
   * Used in SubadminManagement component
   */
  SAVE_SUBADMIN: 'Failed to save subadmin',

  /**
   * Failed to remove subadmin
   * Used in SubadminManagement component
   */
  REMOVE_SUBADMIN: 'Failed to remove subadmin',

  /**
   * Failed to fetch filter options
   * Used in DocumentList component
   */
  FETCH_FILTER_OPTIONS: 'Failed to fetch filter options',

  /**
   * No version available to export
   * Used in DocumentEditor component
   */
  NO_VERSION_TO_EXPORT: 'Please save your document first before exporting',

  // ============================================================================
  // Document Editor Error Messages
  // ============================================================================

  /**
   * Error loading versions in editor
   * Used in DocumentEditor component
   */
  LOAD_VERSIONS: 'Error loading versions:',

  /**
   * Error loading annotations
   * Used in DocumentEditor component
   */
  LOAD_ANNOTATIONS: 'Error loading annotations:',

  /**
   * Failed to search PDF
   * Used in DocumentEditor component
   */
  SEARCH_FAILED: 'Failed to search PDF',

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
   * Non-JSON response error
   * Used when API returns non-JSON response
   */
  NON_JSON_RESPONSE: 'Non-JSON response:',

  /**
   * Failed to extract text from PDF
   * Used in DocumentEditor component
   */
  EXTRACT_TEXT_FAILED: 'Failed to extract text from PDF',

  // ============================================================================
  // Statistics Error Messages
  // ============================================================================

  /**
   * Failed to fetch stats
   * Used in AdminStats component
   */
  FETCH_STATS: 'Failed to fetch stats',

  /**
   * Failed to fetch statistics
   * Used in AdminStats component (alternative message)
   */
  FETCH_STATISTICS: 'Failed to fetch statistics',

  // ============================================================================
  // Profile Error Messages
  // ============================================================================

  /**
   * Failed to update profile
   * Used in ProfileForm component
   */
  UPDATE_PROFILE: 'Failed to update profile',

  /**
   * Failed to create profile
   * Used in ProfileForm, SignUpPage components
   */
  CREATE_PROFILE: 'Failed to create profile',

  /**
   * Username already exists
   * Used in ProfileForm component
   */
  USERNAME_EXISTS: 'Username already exists',

  /**
   * Username or email already exists
   * Used in profiles API route when unique constraint violation occurs
   */
  USERNAME_OR_EMAIL_EXISTS: 'Username or email already exists',

  /**
   * Failed to fetch profile
   * Used in various profile-related components
   */
  FETCH_PROFILE: 'Failed to fetch profile',

  /**
   * Failed to fetch profiles (plural)
   * Used in profiles API service and user management components
   */
  FETCH_PROFILES: 'Failed to fetch profiles',

  /**
   * Failed to check username availability
   */
  CHECK_USERNAME_FAILED: 'Failed to check username availability',

  /**
   * Profile not found
   */
  PROFILE_NOT_FOUND: 'Profile not found',

  /**
   * Profile already exists
   */
  PROFILE_ALREADY_EXISTS: 'Profile already exists',

  /**
   * Invalid user ID format
   */
  INVALID_USER_ID_FORMAT: 'Invalid user ID format',

  // ============================================================================
  // Subadmin Error Messages
  // ============================================================================

  /**
   * Failed to fetch subadmins
   * Used in SubadminManagement component
   */
  FETCH_SUBADMINS: 'Failed to fetch subadmins',

  /**
   * Failed to fetch subadmin
   */
  FETCH_SUBADMIN: 'Failed to fetch subadmin',

  /**
   * Failed to update subadmin
   * Used in SubadminManagement component
   */
  UPDATE_SUBADMIN: 'Failed to update subadmin',

  /**
   * Failed to create subadmin
   */
  CREATE_SUBADMIN: 'Failed to create subadmin',

  /**
   * Failed to fetch users
   * Used in SubadminManagement component
   */
  FETCH_USERS: 'Failed to fetch users',

  /**
   * Cannot change role to/from subadmin
   * Used in profiles API route
   */
  CANNOT_CHANGE_SUBADMIN_ROLE:
    'Cannot change role to/from subadmin. Use /api/admin/subadmins endpoint.',

  /**
   * Only admins can change user roles
   * Used in profiles API route
   */
  ONLY_ADMINS_CAN_CHANGE_ROLES: 'Only admins can change user roles',

  // ============================================================================
  // Storage Error Messages
  // ============================================================================

  /**
   * Storage bucket not found
   * Used in DocumentUpload component when storage bucket is missing
   */
  STORAGE_BUCKET_NOT_FOUND:
    'Storage bucket not found. Please run the storage bucket setup SQL migration in Supabase Dashboard. Go to SQL Editor and run: supabase/migrations/20240101000001_storage_bucket_setup.sql',

  /**
   * Storage upload error
   * Used when file upload to storage fails
   */
  STORAGE_UPLOAD_ERROR: 'Storage upload error',

  /**
   * Storage download error
   * Used when file download from storage fails
   */
  STORAGE_DOWNLOAD_ERROR: 'Storage download error',

  /**
   * Error deleting file from storage
   * Used in DocumentManagement component
   */
  STORAGE_DELETE_ERROR: 'Error deleting file from storage:',

  // ============================================================================
  // Authentication Error Messages
  // ============================================================================

  /**
   * Invalid credentials
   * Used in LoginPage component
   */
  INVALID_CREDENTIALS: 'Invalid username or password',

  /**
   * Failed to create user account
   * Used in SignUpPage component
   */
  CREATE_USER_FAILED: 'Failed to create user account',

  /**
   * Failed to update password
   */
  UPDATE_PASSWORD: 'Failed to update password',

  /**
   * Subadmin permissions not found
   * Used in subadmins API route
   */
  SUBADMIN_PERMISSIONS_NOT_FOUND: 'Subadmin permissions not found',
} as const

/**
 * Type helper for error message keys
 */
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES

