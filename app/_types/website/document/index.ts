export type DocumentFileType = 'PDF' | 'DOCX' | 'XLSX' | 'ZIP'

export interface DocumentItem {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'xls' | 'zip' | 'other';
  size: string;
  url: string;
}

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
  document_title?: string;
  username?: string;
  email?: string;
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

export interface SerializedDocument extends Omit<Document, 'file_size'> {
  file_size: number
}

export interface SerializedVersion extends Omit<UserVersionRaw, 'exported_file_size' | 'created_at' | 'updated_at'> {
  exported_file_size: string | null
  created_at: string
  updated_at: string
}

export interface UserVersionRaw {
  id: string
  original_document_id: string
  user_id: string
  version_number: number
  version_name: string | null
  html_content: string | null
  pdf_text_content: string | null
  pdf_annotations: unknown
  exported_file_path: string | null
  exported_file_size: bigint | null
  exported_mime_type: string | null
  original_file_type: string
  is_draft: boolean
  google_drive_file_id: string | null
  google_edit_link: string | null
  created_at: Date | string
  updated_at: Date | string
}

export interface DocumentWithCreator extends Document {
  creator?: {
    first_name: string
    last_name: string
    username: string
  }
}
