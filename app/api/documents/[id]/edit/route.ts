import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// POST - Save edited document version
export async function POST(
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
    const body = await request.json()

    const { html_content, pdf_text_content, pdf_annotations, version_name } = body

    // Get original document
    const originalDoc = await prisma.documents.findUnique({
      where: { id },
      select: {
        id: true,
        file_type: true,
        file_name: true,
      }
    })

    if (!originalDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get latest version number for this user and document
    const latestVersion = await prisma.user_document_versions.findFirst({
      where: {
        original_document_id: id,
        user_id: user.id,
      },
      orderBy: {
        version_number: 'desc',
      },
      select: {
        version_number: true,
      },
    })

    const nextVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1

    // Save edited version
    const editedVersion = await prisma.user_document_versions.create({
      data: {
        original_document_id: id,
        user_id: user.id,
        version_number: nextVersionNumber,
        version_name: version_name || null,
        html_content: html_content || null,
        pdf_text_content: pdf_text_content || null,
        pdf_annotations: pdf_annotations || null,
        original_file_type: originalDoc.file_type,
        is_draft: false,
      },
    })

    // Serialize BigInt values to strings for JSON
    const serializedVersion = {
      ...editedVersion,
      exported_file_size: editedVersion.exported_file_size ? editedVersion.exported_file_size.toString() : null,
      message: 'Document version saved successfully',
    }

    return NextResponse.json(serializedVersion, { status: 201 })
  } catch (error: any) {
    console.error('Error saving edited document:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to serialize BigInt values for JSON
function serializeVersions(versions: any[]) {
  return versions.map(version => ({
    ...version,
    exported_file_size: version.exported_file_size ? version.exported_file_size.toString() : null,
  }))
}

// GET - Get user's edited versions of a document
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

    const versions = await prisma.user_document_versions.findMany({
      where: {
        original_document_id: id,
        user_id: user.id,
      },
      orderBy: {
        version_number: 'desc',
      },
    })

    // Serialize BigInt values to strings for JSON
    const serializedVersions = serializeVersions(versions)

    return NextResponse.json(serializedVersions)
  } catch (error: any) {
    console.error('Error fetching document versions:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

