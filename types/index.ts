/**
 * Types Index
 * 
 * Central export point for all type definitions.
 * This allows importing multiple types from a single import.
 * 
 * Usage:
 *   import { Document, SerializedDocument } from '@/types'
 *   import { ApiError, ApiResponse, isErrorWithMessage } from '@/types'
 *   import { DocumentWhereInput, ProfileWhereInput } from '@/types'
 */

// Re-export document types
export type {
  Document,
  DocumentFileType,
  DocumentUploadData,
  DocumentSearchFilters,
  DocumentWithCreator,
  SerializedDocument,
  SerializedVersion,
  UserVersionRaw,
  DownloadLog,
} from './document'

// Re-export user types
export type {
  UserRole,
  UserProfile,
  SignUpFormData,
  SubadminPermissions,
} from './user'

// Re-export API types
export type {
  ApiError,
  ApiResponse,
  ApiResponseWithStatus,
  ErrorWithMessage,
  ExtendedError,
  ApiRequestOptions,
  PaginationParams,
  SortParams,
  DateRangeFilter,
  SearchFilter,
  ApiEndpointResponse,
} from './api'

export { isErrorWithMessage } from './api'

// Re-export Prisma types
export type {
  DocumentWhereInput,
  DocumentCreateInput,
  DocumentUpdateInput,
  ProfileWhereInput,
  ProfileCreateInput,
  ProfileUpdateInput,
  DownloadLogWhereInput,
  DownloadLogCreateInput,
  UserVersionWhereInput,
  UserVersionCreateInput,
  UserVersionUpdateInput,
  SubadminPermissionWhereInput,
  SubadminPermissionCreateInput,
  SubadminPermissionUpdateInput,
  DateFilter,
  GenericFilter,
  PrismaSelect,
} from './prisma'

export { createDateFilter } from './prisma'

// Re-export document editor types
export type {
  PDFAnnotation,
  UserVersion,
  DocumentType,
  PdfTextItem,
  TipTapEditor,
  AnnotationTool,
  SearchResult,
} from './documentEditor'

export { isTextItem } from './documentEditor'

