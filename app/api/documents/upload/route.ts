/**
 * Document Upload API Route
 * 
 * Handles document upload operations:
 * - POST: Upload new document or version
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { hasPermission } from '@/lib/utils/roles'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES, STORAGE_BUCKETS, STORAGE_CONFIG } from '@/constants'

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext || '')) return 'document'
  if (['xls', 'xlsx'].includes(ext || '')) return 'spreadsheet'
  if (ext === 'zip') return 'archive'
  return 'other'
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canUpload = await hasPermission(user.id, 'can_upload_documents')
    if (!canUpload) {
      return NextResponse.json({ error: 'Permission required: can_upload_documents' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const is_featured = formData.get('is_featured') === 'true'
    const searchable_content = formData.get('searchable_content') as string | null
    const parent_document_id = formData.get('parent_document_id') as string | null

    if (!file || !title || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: file, title, category' },
        { status: 400 }
      )
    }

    // If uploading a new version, validate parent document exists and get version number
    let versionNumber = '1.0'
    let parentDocumentId: string | null = null

    if (parent_document_id) {
      // Get parent document to determine next version
      const parentDoc = await prisma.documents.findUnique({
        where: { id: parent_document_id },
        select: { id: true, parent_document_id: true, version: true }
      })

      if (!parentDoc) {
        return NextResponse.json(
          { error: 'Parent document not found' },
          { status: 404 }
        )
      }

      // Determine root document ID
      const rootId = parentDoc.parent_document_id || parentDoc.id

      // Get all existing versions to calculate next version number
      const existingVersions = await prisma.documents.findMany({
        where: {
          OR: [
            { id: rootId },
            { parent_document_id: rootId }
          ]
        },
        select: { version: true }
      })

      // Find highest version number
      const versionNumbers = existingVersions
        .map(v => parseFloat(v.version || '1.0'))
        .filter(v => !isNaN(v))

      const maxVersion = versionNumbers.length > 0 ? Math.max(...versionNumbers) : 0
      versionNumber = (maxVersion + 0.1).toFixed(1) // Increment by 0.1
      parentDocumentId = rootId
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Upload file to Supabase Storage using centralized bucket configuration
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .upload(filePath, file, {
        cacheControl: STORAGE_CONFIG.CACHE_CONTROL,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 400 }
      )
    }

    // Parse tags if provided
    let parsedTags: string[] = []
    if (tags) {
      try {
        parsedTags = JSON.parse(tags)
      } catch (e) {
        // If not JSON, treat as comma-separated string
        parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean)
      }
    }

    // Insert document record
    const document = await prisma.documents.create({
      data: {
        title,
        description: description || null,
        category,
        tags: parsedTags,
        file_name: file.name,
        file_path: filePath,
        file_size: BigInt(file.size),
        file_type: getFileType(file.name),
        mime_type: file.type,
        version: versionNumber,
        parent_document_id: parentDocumentId,
        is_active: true,
        is_featured: is_featured || false,
        searchable_content: searchable_content || null,
        created_by: user.id,
      }
    })

    return NextResponse.json(
      {
        ...document,
        file_size: Number(document.file_size),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(CONSOLE_MESSAGES.UPLOAD_ERROR, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

