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
import { isAdmin } from '@/lib/utils/roles'
import type { DocumentWhereInput } from '@/types/prisma'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

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
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const sort = searchParams.get('sort') || 'created_at_desc'

    // Build where clause with proper typing
    const where: DocumentWhereInput = {}
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
        // Add one day to include the entire toDate
        const toDateEnd = new Date(toDate)
        toDateEnd.setHours(23, 59, 59, 999)
        where.created_at.lte = toDateEnd
      }
    }

    // If search query exists, use RPC function
    if (searchQuery && searchQuery.trim()) {
      // Use Prisma raw query to call the search_documents function
      // Type the results as array of objects with id and rank
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
        100,
        0
      )

      if (!results || results.length === 0) {
        return NextResponse.json([])
      }

      // Get IDs from search results
      const documentIds = results.map((doc) => doc.id)

      // Build where clause for fetching full documents
      const searchWhere: DocumentWhereInput = {
        id: { in: documentIds },
        // Removed parent_document_id filter to include both root and version documents
      }
      
      // Add date range filters if provided
      if (fromDate || toDate) {
        searchWhere.created_at = {}
        if (fromDate) {
          searchWhere.created_at.gte = new Date(fromDate)
        }
        if (toDate) {
          const toDateEnd = new Date(toDate)
          toDateEnd.setHours(23, 59, 59, 999)
          searchWhere.created_at.lte = toDateEnd
        }
      }

      // Fetch full document data for search results (both root documents and versions)
      // This allows search to show original files and version files separately
      const fullDocuments = await prisma.documents.findMany({
        where: searchWhere,
      })

      // Create a map of search results by ID for ranking
      const searchResultsMap = new Map(
        results.map((r) => [r.id, r] as [string, SearchResult])
      )

      // Merge search results with full document data, preserving search ranking
      const documents = fullDocuments
        .map((doc) => {
          const searchResult = searchResultsMap.get(doc.id)
          return {
            ...doc,
            // Preserve search rank if available
            _rank: searchResult?.rank || 0,
          }
        })
        .sort((a, b) => {
          const rankA = (a as { _rank?: number })._rank || 0
          const rankB = (b as { _rank?: number })._rank || 0
          return rankB - rankA
        }) // Sort by search rank

      // Filter by tags if provided
      let filteredDocuments = documents
      if (tags && tags.length > 0) {
        filteredDocuments = documents.filter((doc) => {
          if (!doc.tags || !Array.isArray(doc.tags)) return false
          return tags.some((selectedTag) => doc.tags.includes(selectedTag))
        })
      }

      // Convert BigInt file_size to Number and remove _rank
      const serializedDocuments = filteredDocuments.map((doc) => {
        const { _rank, ...docWithoutRank } = doc as typeof doc & {
          _rank?: number
        }
        return {
          ...docWithoutRank,
          file_size: typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size,
        }
      })

      return NextResponse.json(serializedDocuments)
    }

    // Build orderBy clause based on sort parameter
    let orderBy: { [key: string]: 'asc' | 'desc' } = { created_at: 'desc' }
    
    if (sort === 'created_at_asc') {
      orderBy = { created_at: 'asc' }
    } else if (sort === 'created_at_desc') {
      orderBy = { created_at: 'desc' }
    } else if (sort === 'title_asc') {
      orderBy = { title: 'asc' }
    } else if (sort === 'title_desc') {
      orderBy = { title: 'desc' }
    } else if (sort === 'download_count_asc') {
      orderBy = { download_count: 'asc' }
    } else if (sort === 'download_count_desc') {
      orderBy = { download_count: 'desc' }
    }

    // Regular query - only show root documents (not versions)
    // Versions have parent_document_id set, so we filter those out
    const documents = await prisma.documents.findMany({
      where: {
        ...where,
        parent_document_id: null, // Only root documents
      },
      orderBy
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
  } catch (error) {
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

    return NextResponse.json(
      {
        ...document,
        file_size: Number(document.file_size),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_CREATING_DOCUMENT, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

