import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Get all versions of a document (including the document itself and its versions)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const rootId = rootResult[0].root_id

    // Fetch all versions (root + all children) using index on parent_document_id
    const versions = await prisma.$queryRaw<any[]>`
      SELECT d.*
      FROM documents d
      WHERE d.id = ${rootId}::uuid
         OR d.parent_document_id = ${rootId}::uuid
      ORDER BY d.created_at DESC
    `

    // If no versions returned, document doesn't exist
    if (!versions || versions.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Convert BigInt file_size to Number for JSON serialization
    // Ensure all IDs are strings (UUIDs)
    // Raw query returns dates as strings, so we need to handle that
    const serializedVersions = versions.map((doc: any) => ({
      ...doc,
      id: String(doc.id), // Ensure ID is a string
      file_size: typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size,
      created_at: typeof doc.created_at === 'string' ? doc.created_at : doc.created_at?.toISOString() || new Date().toISOString(),
      updated_at: typeof doc.updated_at === 'string' ? doc.updated_at : doc.updated_at?.toISOString() || null,
      tags: Array.isArray(doc.tags) ? doc.tags : [],
    }))

    return NextResponse.json(serializedVersions)
  } catch (error: any) {
    console.error('Error fetching document versions:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

