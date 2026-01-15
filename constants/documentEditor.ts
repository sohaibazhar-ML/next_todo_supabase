/**
 * Constants for Document Editor
 * All hardcoded values should be defined here
 */

// API Endpoints
export const API_ENDPOINTS = {
  DOCUMENT_CONVERT: (documentId: string) => `/api/documents/${documentId}/convert`,
  DOCUMENT_EDIT: (documentId: string) => `/api/documents/${documentId}/edit`,
  DOCUMENT_EXPORT: (documentId: string) => `/api/documents/${documentId}/export`,
} as const

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
} as const

// Default Values
export const DEFAULT_VALUES = {
  PDF_SCALE: 1.0,
  PDF_PAGE_NUMBER: 1,
  CONTENT_TIMEOUT: 0,
  TEXT_PREVIEW_LENGTH: 200,
} as const

// PDF Worker Paths
export const PDF_WORKER_PATHS = {
  MJS: '/pdf.worker.min.mjs',
  JS: '/pdf.worker.min.js',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  LOAD_VERSIONS: 'Error loading versions:',
  LOAD_DOCUMENT: 'Failed to load document',
  SAVE_DOCUMENT: 'Failed to save document',
  EXPORT_DOCUMENT: 'Failed to export document',
  LOAD_VERSION: 'Failed to load version',
  INVALID_RESPONSE: 'Server returned an invalid response. Please try again.',
  LOAD_ANNOTATIONS: 'Error loading annotations:',
  SEARCH_ERROR: 'Search error:',
  SEARCH_FAILED: 'Failed to search PDF',
  PDF_LOAD_ERROR: 'PDF load error:',
  NON_JSON_RESPONSE: 'Non-JSON response:',
  EXTRACT_TEXT_FAILED: 'Failed to extract text from PDF',
} as const

// Console Messages
export const CONSOLE_MESSAGES = {
  NON_JSON_RESPONSE: 'Non-JSON response:',
  ERROR_LOADING_VERSIONS: 'Error loading versions:',
  ERROR_LOADING_ANNOTATIONS: 'Error loading annotations:',
  SEARCH_ERROR: 'Search error:',
  PDF_LOAD_ERROR: 'PDF load error:',
  PDF_WORKER_LOADED: 'PDF.js worker loaded successfully:',
  PDF_WORKER_FAILED: 'Failed to load worker from',
  PDF_WORKER_LOADED_JS: 'PDF.js worker loaded from .js:',
  PDF_WORKER_FAILED_JS: 'Failed to load worker from .js:',
  ERROR_EXTRACTING_TEXT: 'Error extracting text:',
} as const

// Document Types
export const DOCUMENT_TYPES = {
  DOCX: 'docx',
  PDF: 'pdf',
} as const

