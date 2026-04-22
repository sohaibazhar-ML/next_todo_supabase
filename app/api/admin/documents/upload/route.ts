/**
 * Document Upload API Route
 * 
 * Handles document upload operations:
 * - POST: Upload new document or version
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    // Role-based restriction: Only Admins can upload
    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: ERROR_MESSAGES.PERMISSION_REQUIRED_UPLOAD_DOCUMENTS }, { status: 403 })
    }

    const formData = await request.formData()
    const files = formData.getAll('file') as File[]
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const is_featured = formData.get('is_featured') === 'true'

    if (files.length === 0 || !category) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS },
        { status: 400 }
      )
    }




    const createdDocuments = []

    for (const file of files) {
        // Generate unique file path
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKETS.DOCUMENTS)
          .upload(filePath, file, {
            cacheControl: STORAGE_CONFIG.CACHE_CONTROL,
            upsert: false,
          })

        if (uploadError) {
          console.error(`Storage upload error for ${file.name}:`, uploadError)
          continue;
        }

        const fileType = getFileType(file.name)
        const docTitle = files.length === 1 && title ? title : file.name;

        // Insert document record
        const document = await prisma.documents.create({
          data: {
            title: docTitle,
            description: description || null,
            category,
            file_name: file.name,
            file_path: filePath,
            file_size: BigInt(file.size),
            file_type: fileType,
            mime_type: file.type,
            is_featured: is_featured || false,
            created_by: user.id,
          }
        })

        createdDocuments.push({
            ...document,
            file_size: Number(document.file_size),
        })
    }

    if (createdDocuments.length === 0) {
      return NextResponse.json({ error: "Upload failed: All files were rejected by the storage provider due to permission policies or other errors." }, { status: 400 })
    }

    const responsePayload = files.length === 1 ? createdDocuments[0] : createdDocuments;
    
    return new NextResponse(
      JSON.stringify(responsePayload, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      ), 
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error: unknown) {
    console.error(CONSOLE_MESSAGES.UPLOAD_ERROR, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
