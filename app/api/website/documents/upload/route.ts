/**
 * User Document Upload API Route
 * 
 * Allows authenticated users to upload their own documents.
 * - POST: Upload a document (authenticated users only)
 * - Documents are associated with the user via created_by field
 * - Category is set to 'user-upload' to distinguish from admin docs
 * - is_featured is always false for user uploads
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { STORAGE_BUCKETS, STORAGE_CONFIG } from '@/constants'

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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const recipient = formData.get('recipient') as string | null

    if (!file || !title?.trim()) {
      return NextResponse.json(
        { error: 'Title and file are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-zip-compressed',
    ]

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOCX, XLSX, ZIP' },
        { status: 400 }
      )
    }

    // 50MB file size limit
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      )
    }

    // Generate unique file path under user's folder
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Convert file to ArrayBuffer for more reliable server-side upload
    const arrayBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: STORAGE_CONFIG.CACHE_CONTROL,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Create database record
    const fileType = getFileType(file.name)
    try {
      const document = await prisma.documents.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          recipient: recipient?.trim() || null,
          category: 'Personal',
          tags: [],
          file_name: file.name,
          file_path: filePath,
          file_size: BigInt(file.size),
          file_type: fileType,
          mime_type: file.type,
          is_featured: false,
          created_by: user.id,
        } as any
      })

      return new NextResponse(
        JSON.stringify({
          ...document,
          file_size: Number(document.file_size),
        }, (key, value) =>
          typeof value === 'bigint' ? Number(value) : value
        ),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    } catch (dbError: any) {
      console.error('Database record creation error:', dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message || 'Failed to create record'}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('User document upload global error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
