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

    // Get the main document
    const mainDocument = await prisma.documents.findUnique({
      where: { id }
    })

    if (!mainDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Determine the root document ID (if this is a version, get the parent; otherwise use this ID)
    const rootDocumentId = mainDocument.parent_document_id || mainDocument.id

    // Get all versions (documents with this as parent, or this document if it's the root)
    const versions = await prisma.documents.findMany({
      where: {
        OR: [
          { id: rootDocumentId }, // The root document
          { parent_document_id: rootDocumentId } // All versions
        ]
      },
      orderBy: [
        { created_at: 'desc' } // Newest first
      ]
    })

    // Convert BigInt file_size to Number for JSON serialization
    // Ensure all IDs are strings (UUIDs)
    const serializedVersions = versions.map((doc) => ({
      ...doc,
      id: String(doc.id), // Ensure ID is a string
      file_size: typeof doc.file_size === 'bigint' ? Number(doc.file_size) : doc.file_size,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at?.toISOString() || null,
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

