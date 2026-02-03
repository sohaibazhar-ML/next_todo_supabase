export type DocumentFileType = 'PDF' | 'DOCX' | 'XLSX' | 'ZIP'

export interface Document {
  id: string
  title: string
  description: string | null
  category: string
  tags: string[] | null
  file_name: string
  file_path: string
  file_size: number
  file_type: DocumentFileType
  mime_type: string
  version: string | null
  parent_document_id: string | null
  is_active: boolean
  is_featured: boolean
  download_count: number
  searchable_content: string | null
  google_drive_template_id: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface DownloadLog {
  id: string
  document_id: string
  user_id: string
  downloaded_at: string
  ip_address: string | null
  user_agent: string | null
  context: string | null
  metadata: Record<string, unknown> | null
}

export interface DocumentUploadData {
  title: string
  description?: string
  category: string
  tags?: string[]
  file: File
  is_featured?: boolean
  searchable_content?: string
}

export interface DocumentSearchFilters {
  searchQuery?: string
  category?: string
  fileType?: DocumentFileType
  tags?: string[]
  featuredOnly?: boolean
  fromDate?: string
  toDate?: string
  sort?: 'created_at_desc' | 'created_at_asc' | 'title_asc' | 'title_desc' | 'download_count_desc' | 'download_count_asc'
}

export interface DocumentWithCreator extends Document {
  creator?: {
    first_name: string
    last_name: string
    username: string
  }
}

// ============================================================================
// Serialization Types
// ============================================================================

/**
 * Serialized document with BigInt converted to number
 * Used when documents are returned from API (BigInt cannot be serialized to JSON)
 * 
 * The file_size field is converted from BigInt to number during serialization
 */
export interface SerializedDocument extends Omit<Document, 'file_size'> {
  /**
   * File size in bytes (converted from BigInt to number)
   */
  file_size: number
}

/**
 * User document version from database (with BigInt)
 * This is the raw type from Prisma before serialization
 */
export interface UserVersionRaw {
  id: string
  original_document_id: string
  user_id: string
  version_number: number
  version_name: string | null
  html_content: string | null
  pdf_text_content: string | null
  pdf_annotations: unknown // JSON field from database
  exported_file_path: string | null
  exported_file_size: bigint | null // BigInt from database
  exported_mime_type: string | null
  original_file_type: string
  is_draft: boolean
  google_drive_file_id: string | null
  google_edit_link: string | null
  created_at: Date | string
  updated_at: Date | string
}

/**
 * Serialized user document version
 * Used when versions are returned from API (BigInt cannot be serialized to JSON)
 * 
 * The exported_file_size field is converted from BigInt to string during serialization
 */
export interface SerializedVersion {
  id: string
  original_document_id: string
  user_id: string
  version_number: number
  version_name: string | null
  html_content: string | null
  pdf_text_content: string | null
  pdf_annotations: unknown // JSON field (parsed from database)
  exported_file_path: string | null
  /**
   * Exported file size as string (converted from BigInt)
   * BigInt values are serialized as strings in JSON
   */
  exported_file_size: string | null
  exported_mime_type: string | null
  original_file_type: string
  is_draft: boolean
  google_drive_file_id: string | null
  google_edit_link: string | null
  created_at: string
  updated_at: string
}

