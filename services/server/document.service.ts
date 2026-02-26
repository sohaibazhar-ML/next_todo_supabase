/**
 * Document Server Service
 *
 * Encapsulates all Prisma database operations for document management.
 * API routes delegate to this service for data access.
 */

import { prisma } from '@/lib/prisma'
import type { DocumentWhereInput } from '@/types/prisma'

// ============================================================================
// Types
// ============================================================================

export interface DocumentFilters {
    category?: string | null
    fileType?: string | null
    featuredOnly?: boolean
    tags?: string[]
    fromDate?: string | null
    toDate?: string | null
    sort?: string
}

export interface DocumentSearchParams {
    searchQuery: string
    category?: string | null
    fileType?: string | null
    fromDate?: string | null
    toDate?: string | null
    tags?: string[]
}

export interface DocumentCreateData {
    title: string
    description?: string | null
    category: string
    tags?: string[]
    file_name: string
    file_path: string
    file_size: number
    file_type: string
    mime_type: string
    version?: string
    parent_document_id?: string | null
    is_active?: boolean
    is_featured?: boolean
    searchable_content?: string | null
}

// ============================================================================
// Internal helpers
// ============================================================================

interface SearchResult {
    id: string
    rank?: number
    [key: string]: unknown
}

function buildDateFilter(fromDate?: string | null, toDate?: string | null) {
    if (!fromDate && !toDate) return undefined

    const filter: { gte?: Date; lte?: Date } = {}
    if (fromDate) {
        filter.gte = new Date(fromDate)
    }
    if (toDate) {
        const toDateEnd = new Date(toDate)
        toDateEnd.setHours(23, 59, 59, 999)
        filter.lte = toDateEnd
    }
    return filter
}

function buildOrderBy(sort?: string): { [key: string]: 'asc' | 'desc' } {
    switch (sort) {
        case 'created_at_asc':
            return { created_at: 'asc' }
        case 'title_asc':
            return { title: 'asc' }
        case 'title_desc':
            return { title: 'desc' }
        case 'download_count_asc':
            return { download_count: 'asc' }
        case 'download_count_desc':
            return { download_count: 'desc' }
        case 'created_at_desc':
        default:
            return { created_at: 'desc' }
    }
}

function serializeDocuments<T extends { file_size: bigint | number }>(
    docs: T[]
) {
    return docs.map((doc) => ({
        ...doc,
        file_size:
            typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size,
    }))
}

function filterByTags<T extends { tags: string[] | null }>(
    docs: T[],
    tags?: string[]
) {
    if (!tags || tags.length === 0) return docs
    return docs.filter((doc) => {
        if (!doc.tags || !Array.isArray(doc.tags)) return false
        return tags.some((selectedTag) => doc.tags!.includes(selectedTag))
    })
}

// ============================================================================
// Service Methods
// ============================================================================

/**
 * Get documents with optional filters (non-search, regular listing)
 * Only returns root documents (not versions)
 */
export async function getDocuments(filters: DocumentFilters) {
    const where: DocumentWhereInput = {}

    if (filters.category) where.category = filters.category
    if (filters.fileType) where.file_type = filters.fileType
    if (filters.featuredOnly) where.is_featured = true

    const dateFilter = buildDateFilter(filters.fromDate, filters.toDate)
    if (dateFilter) where.created_at = dateFilter

    const orderBy = buildOrderBy(filters.sort)

    const documents = await prisma.documents.findMany({
        where: {
            ...where,
            parent_document_id: null, // Only root documents
        },
        orderBy,
    })

    const filtered = filterByTags(documents, filters.tags)
    return serializeDocuments(filtered)
}

/**
 * Search documents using full-text search via raw SQL
 */
export async function searchDocuments(params: DocumentSearchParams) {
    const results = await prisma.$queryRawUnsafe<SearchResult[]>(
        `SELECT * FROM search_documents($1::text, $2::text, $3::text, $4::integer, $5::integer)`,
        params.searchQuery,
        params.category || null,
        params.fileType || null,
        100,
        0
    )

    if (!results || results.length === 0) {
        return []
    }

    // Get IDs from search results
    const documentIds = results.map((doc) => doc.id)

    // Build where clause for fetching full documents
    const searchWhere: DocumentWhereInput = {
        id: { in: documentIds },
    }

    const dateFilter = buildDateFilter(params.fromDate, params.toDate)
    if (dateFilter) searchWhere.created_at = dateFilter

    // Fetch full document data for search results
    const fullDocuments = await prisma.documents.findMany({
        where: searchWhere,
    })

    // Create a map for ranking
    const searchResultsMap = new Map(
        results.map((r) => [r.id, r] as [string, SearchResult])
    )

    // Merge with search ranking
    const rankedDocuments = fullDocuments
        .map((doc) => {
            const searchResult = searchResultsMap.get(doc.id)
            return {
                ...doc,
                _rank: searchResult?.rank || 0,
            }
        })
        .sort((a, b) => b._rank - a._rank)

    // Filter by tags
    const filtered = filterByTags(rankedDocuments, params.tags)

    // Serialize: remove _rank and convert BigInt
    return filtered.map(({ _rank: _, ...docWithoutRank }) => {
        return {
            ...docWithoutRank,
            file_size:
                typeof docWithoutRank.file_size === 'bigint'
                    ? Number(docWithoutRank.file_size)
                    : docWithoutRank.file_size,
        }
    })
}

/**
 * Create a new document
 */
export async function createDocument(data: DocumentCreateData, userId: string) {
    const document = await prisma.documents.create({
        data: {
            title: data.title,
            description: data.description || null,
            category: data.category,
            tags: data.tags && data.tags.length > 0 ? data.tags : [],
            file_name: data.file_name,
            file_path: data.file_path,
            file_size: BigInt(data.file_size),
            file_type: data.file_type,
            mime_type: data.mime_type,
            version: data.version || '1.0',
            parent_document_id: data.parent_document_id || null,
            is_active: data.is_active ?? true,
            is_featured: data.is_featured || false,
            searchable_content: data.searchable_content || null,
            created_by: userId,
        },
    })

    return {
        ...document,
        file_size: Number(document.file_size),
    }
}
