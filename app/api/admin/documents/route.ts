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

    const page = parseInt(searchParams.get('_page') || '1')
    const perPage = parseInt(searchParams.get('_perPage') || '10')
    const category = searchParams.get('category')
    const fileType = searchParams.get('fileType')
    const featuredOnly = searchParams.get('featuredOnly') === 'true'
    const searchQuery = searchParams.get('searchQuery') || searchParams.get('q')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const fromDate = searchParams.get('fromDate') || searchParams.get('gte_created_at')
    const toDate = searchParams.get('toDate') || searchParams.get('lte_created_at')
    const sortField = searchParams.get('_sortField') || 'created_at'
    const sortOrder = (searchParams.get('_sortOrder') || 'DESC').toLowerCase()

    // Build where clause with proper typing
    const where: Prisma.documentsWhereInput = {}
    if (category) where.category = category
    if (fileType) where.file_type = fileType
    if (featuredOnly) where.is_featured = true

    // Date range filters
    if (fromDate || toDate) {
      where.created_at = {}
      if (fromDate) {
        where.created_at.gte = new Date(fromDate)
      }
      if (toDate) {
        const toDateEnd = new Date(toDate)
        toDateEnd.setHours(23, 59, 59, 999)
        where.created_at.lte = toDateEnd
      }
    }

    // If search query exists, use RPC function
    if (searchQuery && searchQuery.trim()) {
      interface SearchResult {
        id: string
        rank?: number
        [key: string]: unknown
      }
      const results = await prisma.$queryRawUnsafe<SearchResult[]>(
        `SELECT * FROM search_documents($1::text, $2::text, $3::text, $4::integer, $5::integer)`,
        searchQuery,
        category || null,
        fileType || null,
        100, // Search limit
        0
      )

      if (!results || results.length === 0) {
        return NextResponse.json({ data: [], total: 0 })
      }

      const documentIds = results.map((doc) => doc.id)
      const searchWhere: Prisma.documentsWhereInput = {
        id: { in: documentIds },
        ...where
      }

      const [fullDocuments, total] = await Promise.all([
        prisma.documents.findMany({
          where: searchWhere,
          skip: (page - 1) * perPage,
          take: perPage,
          orderBy: { [sortField]: sortOrder as 'asc' | 'desc' }
        }),
        prisma.documents.count({ where: searchWhere })
      ])

      const searchResultsMap = new Map(results.map((r) => [r.id, r] as [string, SearchResult]))

      const serializedDocuments = fullDocuments.map((doc) => {
        const searchResult = searchResultsMap.get(doc.id)
        return {
          ...doc,
          file_size: typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size,
          _rank: searchResult?.rank || 0,
        }
      })

      return NextResponse.json({ data: serializedDocuments, total })
    }

    // Regular query
    const [documents, total] = await Promise.all([
      prisma.documents.findMany({
        where: {
          ...where,
          parent_document_id: null,
        },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { [sortField]: sortOrder as 'asc' | 'desc' }
      }),
      prisma.documents.count({
        where: {
          ...where,
          parent_document_id: null,
        }
      })
    ])

    const serializedDocuments = documents.map((doc) => ({
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
        version: body.version || '1.0',
        parent_document_id: body.parent_document_id || null,
        is_active: body.is_active ?? true,
        is_featured: body.is_featured || false,
        searchable_content: body.searchable_content || null,
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
  } catch (error: unknown) {
    console.error(CONSOLE_MESSAGES.ERROR_CREATING_DOCUMENT, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

