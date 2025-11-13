import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/utils/roles'

// GET - Get documents with optional filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const fileType = searchParams.get('fileType')
    const featuredOnly = searchParams.get('featuredOnly') === 'true'
    const searchQuery = searchParams.get('searchQuery')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    // Build where clause
    const where: any = {}
    if (category) where.category = category
    if (fileType) where.file_type = fileType
    if (featuredOnly) where.is_featured = true

    // If search query exists, use RPC function
    if (searchQuery && searchQuery.trim()) {
      // Use Prisma raw query to call the search_documents function
      const results = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM search_documents($1::text, $2::text, $3::text, $4::integer, $5::integer)`,
        searchQuery,
        category || null,
        fileType || null,
        100,
        0
      )

      // Map results to Document format
      const documents = results.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        tags: doc.tags,
        file_name: doc.file_name,
        file_path: doc.file_path,
        file_size: typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size,
        file_type: doc.file_type,
        mime_type: '', // RPC doesn't return this
        version: null,
        parent_document_id: null,
        is_active: true,
        is_featured: doc.is_featured || false,
        download_count: doc.download_count,
        searchable_content: null,
        created_at: doc.created_at,
        updated_at: doc.created_at,
        created_by: null,
      }))

      // Filter by tags if provided
      let filteredDocuments = documents
      if (tags && tags.length > 0) {
        filteredDocuments = documents.filter((doc: any) => {
          if (!doc.tags || !Array.isArray(doc.tags)) return false
          return tags.some(selectedTag => doc.tags.includes(selectedTag))
        })
      }

      return NextResponse.json(filteredDocuments)
    }

    // Regular query - only show root documents (not versions)
    // Versions have parent_document_id set, so we filter those out
    const documents = await prisma.documents.findMany({
      where: {
        ...where,
        parent_document_id: null, // Only root documents
      },
      orderBy: { created_at: 'desc' }
    })

    // Filter by tags client-side if provided
    let filteredDocuments = documents
    if (tags && tags.length > 0) {
      filteredDocuments = documents.filter((doc) => {
        if (!doc.tags || !Array.isArray(doc.tags)) return false
        return tags.some(selectedTag => doc.tags.includes(selectedTag))
      })
    }

    // Convert BigInt file_size to Number for JSON serialization
    const serializedDocuments = filteredDocuments.map((doc) => ({
      ...doc,
      file_size: typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size,
    }))

    return NextResponse.json(serializedDocuments)
  } catch (error: any) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create document (admin only)
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

    const body = await request.json()

    const document = await prisma.documents.create({
      data: {
        title: body.title,
        description: body.description || null,
        category: body.category,
        tags: body.tags && body.tags.length > 0 ? body.tags : [],
        file_name: body.file_name,
        file_path: body.file_path,
        file_size: BigInt(body.file_size),
        file_type: body.file_type,
        mime_type: body.mime_type,
        version: body.version || '1.0',
        parent_document_id: body.parent_document_id || null,
        is_active: body.is_active ?? true,
        is_featured: body.is_featured || false,
        searchable_content: body.searchable_content || null,
        created_by: user.id,
      }
    })

    return NextResponse.json({
      ...document,
      file_size: Number(document.file_size)
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

