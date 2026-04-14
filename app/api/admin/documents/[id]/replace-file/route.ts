/**
 * Document File Replacement API Route
 * 
 * Handles replacing a document's file while preserving all metadata:
 * - PUT: Replace file (admin only)
 *   - Deletes old file from Supabase Storage
 *   - Uploads new file to Supabase Storage
 *   - Updates file-related fields (file_name, file_path, file_size, file_type, mime_type)
 *   - Preserves all other fields (title, description, category, tags, download_count, etc.)
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/utils/roles'
import { isErrorWithMessage } from '@/utils/error-utils'
import { CONSOLE_MESSAGES, ERROR_MESSAGES, STORAGE_BUCKETS, STORAGE_CONFIG } from '@/constants'

function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext || '')) return 'document'
  if (['xls', 'xlsx'].includes(ext || '')) return 'spreadsheet'
  if (ext === 'zip') return 'archive'
  return 'other'
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: ERROR_MESSAGES.ADMIN_ACCESS_REQUIRED }, { status: 403 })
    }

    const { id } = await params

    // Get the existing document
    const existingDoc = await prisma.documents.findUnique({
      where: { id },
      select: { id: true, file_path: true }
    })

    if (!existingDoc) {
      return NextResponse.json({ error: ERROR_MESSAGES.DOCUMENT_NOT_FOUND }, { status: 404 })
    }

    // Parse the multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided for replacement' },
        { status: 400 }
      )
    }

    // Parse metadata fields that may have been sent along
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const category = formData.get('category') as string | null
    const is_featured = formData.get('is_featured')
    const tagsRaw = formData.get('tags') as string | null

    let parsedTags: string[] | undefined
    if (tagsRaw) {
      try {
        parsedTags = JSON.parse(tagsRaw)
      } catch {
        parsedTags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      }
    }

    // 1. Upload new file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const newFilePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .upload(newFilePath, file, {
        cacheControl: STORAGE_CONFIG.CACHE_CONTROL,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error during file replacement:', uploadError)
      return NextResponse.json(
        { error: `Failed to upload replacement file: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // 2. Delete old file from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .remove([existingDoc.file_path])

    if (deleteError) {
      // Log but don't fail — the new file is already uploaded
      console.error('Failed to delete old file from storage:', deleteError)
    }

    // 3. Update database record with new file info + any metadata changes
    const fileType = getFileType(file.name)

    const updateData: Record<string, unknown> = {
      file_name: file.name,
      file_path: newFilePath,
      file_size: BigInt(file.size),
      file_type: fileType,
      mime_type: file.type,
      updated_at: new Date(),
    }

    // Also apply any metadata updates sent along
    if (title !== null && title !== undefined) updateData.title = title
    if (description !== null && description !== undefined) updateData.description = description
    if (category !== null && category !== undefined) updateData.category = category
    if (parsedTags !== undefined) updateData.tags = parsedTags
    if (is_featured !== null && is_featured !== undefined) {
      updateData.is_featured = is_featured === 'true'
    }

    const updatedDocument = await prisma.documents.update({
      where: { id },
      data: updateData,
    })

    return new NextResponse(
      JSON.stringify({
        ...updatedDocument,
        file_size: Number(updatedDocument.file_size),
      }, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error: unknown) {
    console.error('Error replacing document file:', error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
