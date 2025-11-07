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
  metadata: Record<string, any> | null
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
}

export interface DocumentWithCreator extends Document {
  creator?: {
    first_name: string
    last_name: string
    username: string
  }
}

