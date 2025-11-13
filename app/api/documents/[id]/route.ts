import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/utils/roles'

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
      file_size: Number(document.file_size)
    })
  } catch (error: any) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update document (admin only)
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

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.category !== undefined) updateData.category = body.category
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    updateData.updated_at = new Date()

    const document = await prisma.documents.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      ...document,
      file_size: Number(document.file_size)
    })
  } catch (error: any) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
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
      file_path: document.file_path
    })
  } catch (error: any) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

