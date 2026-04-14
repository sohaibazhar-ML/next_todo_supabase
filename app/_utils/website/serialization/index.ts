/**
 * Utility functions for serializing data (especially for BigInt handling)
 * 
 * These functions convert BigInt values to JSON-serializable types (number or string)
 * since BigInt cannot be directly serialized to JSON.
 * 
 * Usage:
 *   import { serializeDocument, serializeDocuments, serializeProfile } from '@/utils/serialization'
 *   const serialized = serializeDocument(doc)
 *   const profile = serializeProfile(prismaProfile)
 */

import type { Document } from '@/types/document'
import type { SerializedDocument } from '@/types/document'
import type { UserProfile, UserRole } from '@/types/user'

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
// Profile Serialization
// ============================================================================

/**
 * Prisma profile type (raw from database)
 * This represents the profile as returned by Prisma with Date objects
 */
type PrismaProfile = {
  id: string
  username: string
  first_name: string
  last_name: string
  current_address: string
  country_of_origin: string
  email: string
  phone_number: string
  number_of_adults: number
  number_of_children: number
  pets_type: string | null
  new_address_switzerland: string
  marketing_consent: boolean
  terms_accepted: boolean
  data_privacy_accepted: boolean
  email_confirmed: boolean
  email_confirmed_at: Date | null
  keep_me_logged_in: boolean
  role: string
  created_at: Date
  updated_at: Date
}

/**
 * Serialize a profile object, converting Date objects to ISO strings
 * 
 * Prisma returns Date objects for created_at, updated_at, and email_confirmed_at,
 * which need to be converted to strings for JSON serialization and type compatibility
 * with the UserProfile interface.
 * 
 * @param profile - Prisma profile object with Date objects
 * @returns Serialized profile with Date objects converted to ISO strings
 * 
 * @example
 * ```typescript
 * const profile = await prisma.profiles.findUnique({ where: { id } })
 * const serialized = serializeProfile(profile) // dates are now strings
 * return serialized
 * ```
 */
export function serializeProfile(profile: PrismaProfile): UserProfile {
  return {
    id: profile.id,
    username: profile.username,
    first_name: profile.first_name,
    last_name: profile.last_name,
    current_address: profile.current_address,
    country_of_origin: profile.country_of_origin,
    email: profile.email,
    phone_number: profile.phone_number,
    number_of_adults: profile.number_of_adults,
    number_of_children: profile.number_of_children,
    pets_type: profile.pets_type,
    new_address_switzerland: profile.new_address_switzerland,
    marketing_consent: profile.marketing_consent,
    terms_accepted: profile.terms_accepted,
    data_privacy_accepted: profile.data_privacy_accepted,
    email_confirmed: profile.email_confirmed,
    email_confirmed_at: profile.email_confirmed_at?.toISOString() || null,
    keep_me_logged_in: profile.keep_me_logged_in,
    role: profile.role as UserRole,
    created_at: profile.created_at.toISOString(),
    updated_at: profile.updated_at.toISOString(),
  }
}

/**
 * Serialize an array of profiles
 * 
 * Converts Date objects to ISO strings for all profiles in the array.
 * 
 * @param profiles - Array of Prisma profile objects with Date objects
 * @returns Array of serialized profiles with Date objects converted to ISO strings
 * 
 * @example
 * ```typescript
 * const profiles = await prisma.profiles.findMany()
 * const serialized = serializeProfiles(profiles)
 * return NextResponse.json(serialized)
 * ```
 */
export function serializeProfiles(profiles: PrismaProfile[]): UserProfile[] {
  return profiles.map(serializeProfile)
}

