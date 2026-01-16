/**
 * Document by ID API Route
 * 
 * Handles single document operations:
 * - GET: Fetch single document
 * - PUT: Update document (admin only)
 * - DELETE: Delete document (admin only)
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Use Prisma types for updates
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/utils/roles'
import type { DocumentUpdateInput } from '@/types/prisma'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

// GET - Get single document
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

    const document = await prisma.documents.findUnique({
      where: { id }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...document,
      file_size: Number(document.file_size),
    })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_FETCHING_DOCUMENT, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// PUT - Update document (admin only)
// Following Google Docs behavior: Updates metadata for all versions in the version tree
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()

    // Get the document to find root document ID
    const document = await prisma.documents.findUnique({
      where: { id },
      select: { id: true, parent_document_id: true }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Determine root document ID (Google Docs behavior: all versions share metadata)
    // Root is either the document itself (if it has no parent) or its parent
    const rootId = document.parent_document_id || document.id

    // Prepare update data (only metadata fields, not file-specific fields)
    const updateData: DocumentUpdateInput = {
      updated_at: new Date(),
    }
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.category !== undefined) updateData.category = body.category
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.searchable_content !== undefined)
      updateData.searchable_content = body.searchable_content

    // Update all versions in the version tree (root + all children)
    // This follows Google Docs behavior where metadata is shared across all versions
    const updateResult = await prisma.documents.updateMany({
      where: {
        OR: [
          { id: rootId },
          { parent_document_id: rootId }
        ]
      },
      data: updateData
    })

    // Return the updated document (the one that was requested)
    const updatedDocument = await prisma.documents.findUnique({
      where: { id }
    })

    if (!updatedDocument) {
      return NextResponse.json({ error: 'Document not found after update' }, { status: 404 })
    }

    return NextResponse.json({
      ...updatedDocument,
      file_size: Number(updatedDocument.file_size),
      versionsUpdated: updateResult.count,
    })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_UPDATING_DOCUMENT, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE - Delete document (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Get document to get file path for storage deletion
    const document = await prisma.documents.findUnique({
      where: { id },
      select: { file_path: true }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete from database (cascade will handle download_logs)
    await prisma.documents.delete({
      where: { id }
    })

    // Delete from storage (client will handle this separately if needed)
    // We return the file_path so client can delete it
    return NextResponse.json({ 
      message: 'Document deleted successfully',
      file_path: document.file_path,
    })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_DELETING_DOCUMENT, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

