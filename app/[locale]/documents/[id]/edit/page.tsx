import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import DocumentEditor from '@/components/DocumentEditor'
import type { Document, DocumentFileType } from '@/types/document'

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditDocumentPage({ params }: PageProps) {
  const { locale, id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Get document
  const document = await prisma.documents.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      tags: true,
      file_name: true,
      file_path: true,
      file_size: true,
      file_type: true,
      mime_type: true,
      version: true,
      parent_document_id: true,
      is_active: true,
      is_featured: true,
      download_count: true,
      searchable_content: true,
      google_drive_template_id: true,
      created_at: true,
      updated_at: true,
      created_by: true,
    },
  })

  if (!document) {
    notFound()
  }

  // Convert file_type to DocumentFileType
  const mapFileType = (type: string): DocumentFileType => {
    const normalized = type.toLowerCase()
    if (normalized === 'pdf') return 'PDF'
    if (normalized === 'document') return 'DOCX'
    if (normalized === 'spreadsheet') return 'XLSX'
    if (normalized === 'archive') return 'ZIP'
    return 'PDF' // default fallback
  }

  // Convert to Document type
  const doc: Document = {
    ...document,
    file_size: Number(document.file_size),
    tags: document.tags || [],
    file_type: mapFileType(document.file_type),
    is_active: document.is_active ?? true,
    is_featured: document.is_featured ?? false,
    download_count: document.download_count ?? 0,
    created_at: document.created_at?.toISOString() || new Date().toISOString(),
    updated_at: document.updated_at?.toISOString() || new Date().toISOString(),
  }

  return <DocumentEditor document={doc} />
}

