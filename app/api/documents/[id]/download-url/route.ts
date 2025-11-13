import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Get signed download URL for a document
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

    // Validate UUID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid document ID' },
        { status: 400 }
      )
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      console.error('Invalid UUID format:', id)
      return NextResponse.json(
        { error: 'Invalid document ID format' },
        { status: 400 }
      )
    }

    // Get document to get file path
    const document = await prisma.documents.findUnique({
      where: { id },
      select: { file_path: true }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get signed URL from Supabase Storage
    const { data: urlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.file_path, 3600) // 1 hour expiry

    if (urlError) {
      console.error('Error creating signed URL:', urlError)
      return NextResponse.json(
        { error: `Failed to generate download URL: ${urlError.message}` },
        { status: 500 }
      )
    }

    if (!urlData || !urlData.signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate download URL: No URL returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({ signedUrl: urlData.signedUrl })
  } catch (error: any) {
    console.error('Error generating download URL:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

