/**
 * Constants Index
 * 
 * Central export point for all constants.
 * This allows importing multiple constant groups from a single import.
 * 
 * Usage:
 *   import { API_ENDPOINTS, ERROR_MESSAGES, CONSOLE_MESSAGES } from '@/constants'
 *   import { CONTENT_TYPES, FILE_EXTENSIONS } from '@/constants'
 *   import { DEFAULT_VALUES } from '@/constants'
 *   import { PDF_WORKER_PATHS, DOCUMENT_TYPES } from '@/constants'
 */

// Re-export all API endpoint constants
export {
  API_ENDPOINTS,
  type ApiEndpoint,
} from './api'

// Re-export all error message constants
export {
  ERROR_MESSAGES,
  type ErrorMessageKey,
} from './errors'

// Re-export all console message constants
export {
  CONSOLE_MESSAGES,
  type ConsoleMessageKey,
} from './console'

// Re-export all content type constants
export {
  CONTENT_TYPES,
  FILE_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  FILE_EXTENSION_TO_MIME,
  MIME_TO_FILE_EXTENSION,
  type ContentType,
  type FileExtension,
} from './contentTypes'

// Re-export all default value constants
export {
  DEFAULT_VALUES,
  type DefaultValueKey,
} from './defaults'

// Re-export document editor specific constants
export {
  PDF_WORKER_PATHS,
  DOCUMENT_TYPES,
  type DocumentType,
} from './documentEditor'

// Re-export admin dashboard specific constants
export {
  ADMIN_DASHBOARD,
  type AdminDashboardKey,
} from './adminDashboard'

// Re-export query keys
export { QUERY_KEYS } from './queryKeys'

// Re-export route constants
export {
  ROUTES,
  type RouteFunction,
} from './routes'

