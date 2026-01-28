/**
 * Document Versions API Route
 * 
 * Handles fetching all versions of a document:
 * - GET: Get all versions (root + children)
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

// GET - Get all versions of a document (including the document itself and its versions)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: 401 })
    }

    const { id } = await params

    // Optimized: Get root document ID first, then fetch all versions efficiently
    // Uses indexes: primary key (id) and parent_document_id index
    const rootResult = await prisma.$queryRaw<Array<{ root_id: string }>>`
      SELECT COALESCE(parent_document_id, id) as root_id
      FROM documents
      WHERE id = ${id}::uuid
      LIMIT 1
    `

    if (!rootResult || rootResult.length === 0) {
      return NextResponse.json({ error: ERROR_MESSAGES.DOCUMENT_NOT_FOUND }, { status: 404 })
    }

    const rootId = rootResult[0].root_id

    // Fetch all versions (root + all children) using index on parent_document_id
    // Type the raw query result
    interface DocumentRow {
      id: string
      file_size: bigint | number
      created_at: Date | string
      updated_at: Date | string | null
      tags: string[] | null
      [key: string]: unknown
    }
    const versions = await prisma.$queryRaw<DocumentRow[]>`
      SELECT d.*
      FROM documents d
      WHERE d.id = ${rootId}::uuid
         OR d.parent_document_id = ${rootId}::uuid
      ORDER BY d.created_at DESC
    `

    // If no versions returned, document doesn't exist
    if (!versions || versions.length === 0) {
      return NextResponse.json({ error: ERROR_MESSAGES.DOCUMENT_NOT_FOUND }, { status: 404 })
    }

    // Convert BigInt file_size to Number for JSON serialization
    // Ensure all IDs are strings (UUIDs)
    // Raw query returns dates as strings, so we need to handle that
    const serializedVersions = versions.map((doc) => ({
      ...doc,
      id: String(doc.id), // Ensure ID is a string
      file_size:
        typeof doc.file_size === 'bigint'
          ? Number(doc.file_size)
          : doc.file_size,
      created_at:
        typeof doc.created_at === 'string'
          ? doc.created_at
          : doc.created_at instanceof Date
            ? doc.created_at.toISOString()
            : new Date().toISOString(),
      updated_at:
        typeof doc.updated_at === 'string'
          ? doc.updated_at
          : doc.updated_at instanceof Date
            ? doc.updated_at.toISOString()
            : null,
      tags: Array.isArray(doc.tags) ? doc.tags : [],
    }))

    return NextResponse.json(serializedVersions)
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_FETCHING_VERSIONS, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

