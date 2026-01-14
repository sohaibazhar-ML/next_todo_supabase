/**
 * Utility functions for serializing data (especially for BigInt handling)
 */

/**
 * Serialize a document object, converting BigInt to Number
 * @param doc - Document object with potential BigInt values
 * @returns Serialized document with BigInt converted to Number
 */
export function serializeDocument(doc: any): any {
  return {
    ...doc,
    file_size: typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size,
  }
}

/**
 * Serialize an array of documents
 * @param docs - Array of document objects
 * @returns Array of serialized documents
 */
export function serializeDocuments(docs: any[]): any[] {
  return docs.map(serializeDocument)
}

/**
 * Serialize user document version (handles exported_file_size BigInt)
 * @param version - User document version object
 * @returns Serialized version with BigInt converted to string
 */
export function serializeVersion(version: any): any {
  return {
    ...version,
    exported_file_size: version.exported_file_size 
      ? version.exported_file_size.toString() 
      : null,
  }
}

/**
 * Serialize an array of versions
 * @param versions - Array of version objects
 * @returns Array of serialized versions
 */
export function serializeVersions(versions: any[]): any[] {
  return versions.map(serializeVersion)
}

