/**
 * Prisma Type Definitions
 * 
 * This file contains Prisma-specific type definitions to replace 'any' types
 * in API routes and database operations.
 * 
 * These types are derived from Prisma's generated types and provide type safety
 * for database queries and filters.
 * 
 * Usage:
 *   import type { DocumentWhereInput, ProfileWhereInput } from '@/types/prisma'
 *   const where: DocumentWhereInput = { category: 'legal' }
 */

import type { Prisma } from '@prisma/client'

// ============================================================================
// Document Filter Types
// ============================================================================

/**
 * Prisma where input for documents table
 * Used in document queries to replace 'any' types
 */
export type DocumentWhereInput = Prisma.documentsWhereInput

/**
 * Prisma where input for document creation
 * Used when creating new documents
 */
export type DocumentCreateInput = Prisma.documentsCreateInput

/**
 * Prisma where input for document updates
 * Used when updating existing documents
 */
export type DocumentUpdateInput = Prisma.documentsUpdateInput

// ============================================================================
// Profile Filter Types
// ============================================================================

/**
 * Prisma where input for profiles table
 * Used in profile queries to replace 'any' types
 */
export type ProfileWhereInput = Prisma.profilesWhereInput

/**
 * Prisma where input for profile creation
 * Used when creating new profiles
 */
export type ProfileCreateInput = Prisma.profilesCreateInput

/**
 * Prisma where input for profile updates
 * Used when updating existing profiles
 */
export type ProfileUpdateInput = Prisma.profilesUpdateInput

// ============================================================================
// Download Log Filter Types
// ============================================================================

/**
 * Prisma where input for download_logs table
 * Used in download log queries to replace 'any' types
 */
export type DownloadLogWhereInput = Prisma.download_logsWhereInput

/**
 * Prisma where input for download log creation
 * Used when creating new download logs
 */
export type DownloadLogCreateInput = Prisma.download_logsCreateInput

// ============================================================================
// User Document Version Filter Types
// ============================================================================

/**
 * Prisma where input for user_document_versions table
 * Used in version queries to replace 'any' types
 */
export type UserVersionWhereInput = Prisma.user_document_versionsWhereInput

/**
 * Prisma where input for user document version creation
 * Used when creating new versions
 */
export type UserVersionCreateInput = Prisma.user_document_versionsCreateInput

/**
 * Prisma where input for user document version updates
 * Used when updating existing versions
 */
export type UserVersionUpdateInput = Prisma.user_document_versionsUpdateInput

// ============================================================================
// Subadmin Permissions Filter Types
// ============================================================================

/**
 * Prisma where input for subadmin_permissions table
 * Used in subadmin permission queries to replace 'any' types
 */
export type SubadminPermissionWhereInput = Prisma.subadmin_permissionsWhereInput

/**
 * Prisma where input for subadmin permission creation
 * Used when creating new subadmin permissions
 */
export type SubadminPermissionCreateInput = Prisma.subadmin_permissionsCreateInput

/**
 * Prisma where input for subadmin permission updates
 * Used when updating existing subadmin permissions
 */
export type SubadminPermissionUpdateInput = Prisma.subadmin_permissionsUpdateInput

// ============================================================================
// Date Filter Helper Types
// ============================================================================

/**
 * Date range filter for Prisma queries
 * Used to build date range filters in a type-safe way
 */
export interface DateFilter {
  /**
   * Greater than or equal to date
   */
  gte?: Date

  /**
   * Less than or equal to date
   */
  lte?: Date

  /**
   * Greater than date
   */
  gt?: Date

  /**
   * Less than date
   */
  lt?: Date
}

/**
 * Helper function to create a date filter from date strings
 * 
 * @param fromDate - Start date string (optional)
 * @param toDate - End date string (optional)
 * @returns DateFilter object for Prisma queries
 * 
 * @example
 * ```typescript
 * const dateFilter = createDateFilter('2024-01-01', '2024-12-31')
 * // Returns: { gte: new Date('2024-01-01'), lte: new Date('2024-12-31') }
 * ```
 */
export function createDateFilter(
  fromDate?: string,
  toDate?: string
): DateFilter | undefined {
  if (!fromDate && !toDate) {
    return undefined
  }

  const filter: DateFilter = {}

  if (fromDate) {
    filter.gte = new Date(fromDate)
  }

  if (toDate) {
    const endDate = new Date(toDate)
    endDate.setHours(23, 59, 59, 999)
    filter.lte = endDate
  }

  return filter
}

// ============================================================================
// Generic Filter Types
// ============================================================================

/**
 * Generic filter object used in API routes
 * Replaces 'any' type for dynamic filter building
 */
export interface GenericFilter {
  [key: string]: unknown
}

/**
 * Type helper for Prisma select fields
 */
export type PrismaSelect<T> = {
  [K in keyof T]?: boolean | PrismaSelect<T[K]>
}

