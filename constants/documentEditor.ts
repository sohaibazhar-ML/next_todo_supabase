/**
 * Document Editor Specific Constants
 * 
 * This file contains constants specific to the document editor functionality.
 * General constants (API endpoints, errors, etc.) are in their respective files.
 * 
 * Usage:
 *   import { PDF_WORKER_PATHS, DOCUMENT_TYPES } from '@/constants/documentEditor'
 *   import { PDF_WORKER_PATHS, DOCUMENT_TYPES } from '@/constants' // via index
 */

// ============================================================================
// PDF Worker Paths
// ============================================================================

/**
 * PDF.js worker file paths
 * Used for initializing PDF.js library in the document editor
 */
export const PDF_WORKER_PATHS = {
  /**
   * Modern ES module worker path (.mjs)
   * Primary path used for PDF.js worker
   */
  MJS: '/pdf.worker.min.mjs',

  /**
   * Fallback worker path (.js)
   * Used if .mjs path fails to load
   */
  JS: '/pdf.worker.min.js',
} as const

// ============================================================================
// Document Types
// ============================================================================

/**
 * Document type identifiers for the editor
 * Used to distinguish between different document formats in the editor
 */
export const DOCUMENT_TYPES = {
  /**
   * DOCX document type (Microsoft Word)
   * Used for Word documents that can be edited in the rich text editor
   */
  DOCX: 'docx',

  /**
   * PDF document type
   * Used for PDF documents that can be viewed and annotated
   */
  PDF: 'pdf',
} as const

/**
 * Type helper for document types
 */
export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES]

