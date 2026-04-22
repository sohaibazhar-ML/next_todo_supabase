export type DocumentFileType = 'PDF' | 'DOCX' | 'XLSX' | 'ZIP'

export interface Document {
  id: string
  title: string
  description: string | null
  category: string
  file_name: string
  file_path: string
  file_size: number
  file_type: DocumentFileType
  mime_type: string
  is_featured: boolean
  download_count: number
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
  file: File
  is_featured?: boolean
}

export interface SerializedDocument extends Omit<Document, 'file_size'> {
  file_size: number
}


export interface DocumentWithCreator extends Document {
  creator?: {
    first_name: string
    last_name: string
    username: string
  }
}
