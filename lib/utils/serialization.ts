/**
 * Utility functions for serializing data (especially for BigInt handling)
 * 
 * These functions convert BigInt values to JSON-serializable types (number or string)
 * since BigInt cannot be directly serialized to JSON.
 * 
 * Usage:
 *   import { serializeDocument, serializeDocuments } from '@/lib/utils/serialization'
 *   const serialized = serializeDocument(doc)
 */

import type { Document } from '@/types/document'
import type { SerializedDocument, SerializedVersion, UserVersionRaw } from '@/types/document'

// ============================================================================
// Document Serialization
// ============================================================================

/**
 * Serialize a document object, converting BigInt file_size to Number
 * 
 * Prisma returns file_size as BigInt, which cannot be serialized to JSON.
 * This function converts it to a number for API responses.
 * 
 * @param doc - Document object with potential BigInt file_size value
 * @returns Serialized document with BigInt file_size converted to number
 * 
 * @example
 * ```typescript
 * const doc = await prisma.documents.findUnique({ where: { id } })
 * const serialized = serializeDocument(doc) // file_size is now number
 * return NextResponse.json(serialized)
 * ```
 */
export function serializeDocument(
  doc: Document & { file_size?: bigint | number }
): SerializedDocument {
  return {
    ...doc,
    file_size:
      typeof doc.file_size === 'bigint'
        ? Number(doc.file_size)
        : doc.file_size ?? 0,
  }
}

/**
 * Serialize an array of documents
 * 
 * Converts BigInt file_size values to numbers for all documents in the array.
 * 
 * @param docs - Array of document objects with potential BigInt values
 * @returns Array of serialized documents with BigInt file_size converted to number
 * 
 * @example
 * ```typescript
 * const docs = await prisma.documents.findMany()
 * const serialized = serializeDocuments(docs)
 * return NextResponse.json(serialized)
 * ```
 */
export function serializeDocuments(
  docs: Array<Document & { file_size?: bigint | number }>
): SerializedDocument[] {
  return docs.map(serializeDocument)
}

// ============================================================================
// Version Serialization
// ============================================================================

/**
 * Serialize user document version, converting BigInt exported_file_size to string
 * 
 * Prisma returns exported_file_size as BigInt, which cannot be serialized to JSON.
 * This function converts it to a string for API responses.
 * 
 * @param version - User document version object with potential BigInt exported_file_size
 * @returns Serialized version with BigInt exported_file_size converted to string
 * 
 * @example
 * ```typescript
 * const version = await prisma.user_document_versions.findUnique({ where: { id } })
 * const serialized = serializeVersion(version) // exported_file_size is now string | null
 * return NextResponse.json(serialized)
 * ```
 */
export function serializeVersion(version: UserVersionRaw): SerializedVersion {
  return {
    ...version,
    exported_file_size:
      version.exported_file_size !== null
        ? version.exported_file_size.toString()
        : null,
    // Ensure dates are strings
    created_at:
      version.created_at instanceof Date
        ? version.created_at.toISOString()
        : version.created_at,
    updated_at:
      version.updated_at instanceof Date
        ? version.updated_at.toISOString()
        : version.updated_at,
  }
}

/**
 * Serialize an array of user document versions
 * 
 * Converts BigInt exported_file_size values to strings for all versions in the array.
 * 
 * @param versions - Array of user document version objects with potential BigInt values
 * @returns Array of serialized versions with BigInt exported_file_size converted to string
 * 
 * @example
 * ```typescript
 * const versions = await prisma.user_document_versions.findMany()
 * const serialized = serializeVersions(versions)
 * return NextResponse.json(serialized)
 * ```
 */
export function serializeVersions(versions: UserVersionRaw[]): SerializedVersion[] {
  return versions.map(serializeVersion)
}

