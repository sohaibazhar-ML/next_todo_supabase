import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/utils/roles'

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

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const is_featured = formData.get('is_featured') === 'true'
    const searchable_content = formData.get('searchable_content') as string | null

    if (!file || !title || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: file, title, category' },
        { status: 400 }
      )
    }

    // Generate unique file path
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Upload file to Supabase Storage using server client
    // Note: The storage policy uses is_user_admin_for_documents function
    // which bypasses RLS, so this should work correctly
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
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
        version: '1.0',
        is_active: true,
        is_featured: is_featured || false,
        searchable_content: searchable_content || null,
        created_by: user.id,
      }
    })

    return NextResponse.json({
      ...document,
      file_size: Number(document.file_size)
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

