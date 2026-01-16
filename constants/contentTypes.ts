/**
 * Content Types and File Extensions Constants
 * 
 * This file contains all MIME types and file extensions used throughout the application.
 * All hardcoded content types and file extensions should be replaced with constants from this file.
 * 
 * Usage:
 *   import { CONTENT_TYPES, FILE_EXTENSIONS } from '@/constants/contentTypes'
 *   headers: { 'Content-Type': CONTENT_TYPES.JSON }
 *   if (file.type === CONTENT_TYPES.PDF) { ... }
 */

// ============================================================================
// MIME Content Types
// ============================================================================

/**
 * MIME content types for HTTP headers and file type checking
 */
export const CONTENT_TYPES = {
  /**
   * JSON content type
   * Used in API request/response headers
   */
  JSON: 'application/json',

  /**
   * PDF content type
   * Used for PDF file uploads and downloads
   */
  PDF: 'application/pdf',

  /**
   * DOCX content type (Microsoft Word)
   * Used for Word document uploads
   */
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  /**
   * XLSX content type (Microsoft Excel)
   * Used for Excel spreadsheet uploads
   */
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  /**
   * ZIP content type
   * Used for ZIP archive uploads
   */
  ZIP: 'application/zip',

  /**
   * HTML content type
   * Used for HTML content in responses
   */
  HTML: 'text/html',

  /**
   * Plain text content type
   * Used for plain text responses
   */
  TEXT: 'text/plain',
} as const

// ============================================================================
// File Extensions
// ============================================================================

/**
 * File extensions used for validation and file type detection
 */
export const FILE_EXTENSIONS = {
  /**
   * PDF file extension
   */
  PDF: '.pdf',

  /**
   * DOCX file extension (Microsoft Word)
   */
  DOCX: '.docx',

  /**
   * XLSX file extension (Microsoft Excel)
   */
  XLSX: '.xlsx',

  /**
   * ZIP file extension
   */
  ZIP: '.zip',
} as const

// ============================================================================
// File Type Arrays (for validation)
// ============================================================================

/**
 * Allowed file types for document uploads
 * Array of MIME types that are accepted for document uploads
 */
export const ALLOWED_FILE_TYPES = [
  CONTENT_TYPES.PDF,
  CONTENT_TYPES.DOCX,
  CONTENT_TYPES.XLSX,
  CONTENT_TYPES.ZIP,
] as const

/**
 * Allowed file extensions for document uploads
 * Array of file extensions that are accepted for document uploads
 */
export const ALLOWED_FILE_EXTENSIONS = [
  FILE_EXTENSIONS.PDF,
  FILE_EXTENSIONS.DOCX,
  FILE_EXTENSIONS.XLSX,
  FILE_EXTENSIONS.ZIP,
] as const

// ============================================================================
// File Type Mappings
// ============================================================================

/**
 * Map file extensions to MIME types
 * Used for file type detection and validation
 */
export const FILE_EXTENSION_TO_MIME: Record<string, string> = {
  [FILE_EXTENSIONS.PDF]: CONTENT_TYPES.PDF,
  [FILE_EXTENSIONS.DOCX]: CONTENT_TYPES.DOCX,
  [FILE_EXTENSIONS.XLSX]: CONTENT_TYPES.XLSX,
  [FILE_EXTENSIONS.ZIP]: CONTENT_TYPES.ZIP,
} as const

/**
 * Map MIME types to file extensions
 * Used for file type detection and validation
 */
export const MIME_TO_FILE_EXTENSION: Record<string, string> = {
  [CONTENT_TYPES.PDF]: FILE_EXTENSIONS.PDF,
  [CONTENT_TYPES.DOCX]: FILE_EXTENSIONS.DOCX,
  [CONTENT_TYPES.XLSX]: FILE_EXTENSIONS.XLSX,
  [CONTENT_TYPES.ZIP]: FILE_EXTENSIONS.ZIP,
} as const

/**
 * Type helpers
 */
export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES]
export type FileExtension = typeof FILE_EXTENSIONS[keyof typeof FILE_EXTENSIONS]

