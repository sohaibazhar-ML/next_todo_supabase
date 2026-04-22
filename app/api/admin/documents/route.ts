/**
 * Documents API Route
 * 
 * Handles document CRUD operations:
 * - GET: Fetch documents with optional filters
 * - POST: Create document (admin only)
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Use Prisma types for filters
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/utils/roles'
import type { Prisma } from '@prisma/client'
import { isErrorWithMessage } from '@/utils'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

// GET - Get documents with optional filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Single record by ID (getOne)
    if (id) {
        try {
            const document = await prisma.documents.findUnique({
                where: { id }
            })
            if (!document) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 })
            }
            return NextResponse.json({
                ...document,
                file_size: typeof document.file_size === 'bigint' ? Number(document.file_size) : document.file_size,
            })
        } catch (error) {
            console.error('[Admin Documents API] getOne error:', error)
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        }
    }

    const ids = searchParams.get('ids')

    // List of records by IDs (getMany)
    if (ids) {
        try {
            const idList = JSON.parse(ids)
            const documents = await prisma.documents.findMany({
                where: { id: { in: idList } }
            })
            const serialized = documents.map((doc: Prisma.documentsGetPayload<{}>) => ({
                ...doc,
                file_size: typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size,
            }))
            return NextResponse.json(serialized)
        } catch (error) {
            console.error('[Admin Documents API] getMany error:', error)
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        }
    }

    const page = parseInt(searchParams.get('_page') || searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('_perPage') || searchParams.get('perPage') || '10')

    // Parse filter from JSON if present (React Admin style)
    const filterStr = searchParams.get('_filters') || searchParams.get('filter')
    let filterObj: Record<string, any> = {}
    if (filterStr) {
        try {
            filterObj = JSON.parse(filterStr);
        } catch (e) {
            console.error('[Admin Documents API] Filter parse error:', e)
        }
    }

    const category = filterObj.category || searchParams.get('category')
    const fileType = filterObj.fileType || searchParams.get('fileType')
    const featuredOnly = filterObj.is_featured === true || searchParams.get('featuredOnly') === 'true'
    const searchQuery = filterObj.q || filterObj.searchQuery || searchParams.get('searchQuery') || searchParams.get('q')
    const tags = (filterObj.tags || searchParams.get('tags'))?.split(',').filter(Boolean)
    const fromDate = filterObj.fromDate || filterObj.gte_created_at || searchParams.get('fromDate') || searchParams.get('gte_created_at')
    const toDate = filterObj.toDate || filterObj.lte_created_at || searchParams.get('toDate') || searchParams.get('lte_created_at')
    
    const sortField = searchParams.get('_sortField') || searchParams.get('sort') || 'created_at'
    const sortOrder = (searchParams.get('_sortOrder') || searchParams.get('order') || 'DESC').toLowerCase()

    const where: Prisma.documentsWhereInput = {}

    if (category) where.category = category
    if (fileType) where.file_type = fileType
    if (featuredOnly) where.is_featured = true

    // Date range filters
    if (fromDate || toDate) {
      where.created_at = {}
      if (fromDate) where.created_at.gte = new Date(fromDate)
      if (toDate) {
        const toDateEnd = new Date(toDate)
        toDateEnd.setHours(23, 59, 59, 999)
        where.created_at.lte = toDateEnd
      }
    }

    // Search logic
    if (searchQuery && searchQuery.trim()) {
      // Try RPC search first for better relevance
      try {
        const results = await prisma.$queryRawUnsafe<{ id: string, rank?: number }[]>(
          `SELECT id, rank FROM search_documents($1::text, $2::text, $3::text, $4::integer, $5::integer)`,
          searchQuery,
          category || null,
          fileType || null,
          100,
          0
        )

        if (results && results.length > 0) {
          const documentIds = results.map((doc: { id: string, rank?: number }) => doc.id)
          where.id = { in: documentIds }
        } else {
          // Fallback to basic Prisma 'contains' search if RPC returns nothing
          where.OR = [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } },
            { file_type: { contains: searchQuery, mode: 'insensitive' } },
            { file_name: { contains: searchQuery, mode: 'insensitive' } },
          ]
        }
      } catch (e) {
        console.warn('[Admin Documents API] RPC search failed, falling back to basic search:', e)
        where.OR = [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { category: { contains: searchQuery, mode: 'insensitive' } },
          { file_type: { contains: searchQuery, mode: 'insensitive' } },
          { file_name: { contains: searchQuery, mode: 'insensitive' } },
        ]
      }
    }

    // SECURITY: Filter out user-uploaded documents (Category: Personal) from Admin Panel
    const personalFilter: Prisma.documentsWhereInput = { category: { notIn: ['Personal', 'personal'] } };
    const finalWhere: Prisma.documentsWhereInput = {
      AND: [where, personalFilter]
    };

    // DIAGNOSTIC LOG
    console.log(`[Admin Documents API] Final WHERE:`, JSON.stringify(finalWhere, null, 2));

    // Regular query with all filters applied
    const [documents, total] = await Promise.all([
      prisma.documents.findMany({
        where: finalWhere,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { [sortField]: sortOrder as 'asc' | 'desc' }
      }),
      prisma.documents.count({ where: finalWhere })
    ])

    console.log(`[Admin Documents API] Found ${documents.length} records out of ${total} total`);

    const serializedDocuments = documents.map((doc: Prisma.documentsGetPayload<{}>) => ({
      ...doc,
      file_size: typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size,
    }))

    return NextResponse.json({ data: serializedDocuments, total })
  } catch (error: unknown) {
    console.error(CONSOLE_MESSAGES.ERROR_FETCHING_DOCUMENTS, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// POST - Create document (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: ERROR_MESSAGES.ADMIN_ACCESS_REQUIRED }, { status: 403 })
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
        is_featured: body.is_featured || false,
        created_by: user.id,
      }
    })

    return new NextResponse(
      JSON.stringify(
        { ...document, file_size: Number(document.file_size) },
        (key, value) => typeof value === 'bigint' ? Number(value) : value
      ),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error: unknown) {
    console.error(CONSOLE_MESSAGES.ERROR_CREATING_DOCUMENT, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// PUT - Update document (admin only)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: ERROR_MESSAGES.ADMIN_ACCESS_REQUIRED }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Convert file_size back to BigInt if present
    const updateData: Record<string, unknown> = { ...data }
    if (updateData.file_size !== undefined) {
      updateData.file_size = BigInt(updateData.file_size as string | number | bigint)
    }

    const document = await prisma.documents.update({
      where: { id },
      data: updateData as Prisma.documentsUpdateInput
    })

    return NextResponse.json({
      ...document,
      file_size: Number(document.file_size),
    })
  } catch (error: unknown) {
    console.error('[Admin Documents API] update error:', error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE - Delete document (admin only)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: ERROR_MESSAGES.ADMIN_ACCESS_REQUIRED }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.documents.delete({
      where: { id }
    })

    return NextResponse.json({ id })
  } catch (error: unknown) {
    console.error('[Admin Documents API] delete error:', error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
