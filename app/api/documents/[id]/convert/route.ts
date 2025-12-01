import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { PDFDocument } from 'pdf-lib'

// GET - Convert document to editable format (HTML for DOCX, text for PDF)
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

    // Get document
    const document = await prisma.documents.findUnique({
      where: { id },
      select: {
        id: true,
        file_path: true,
        file_type: true,
        mime_type: true,
        file_name: true,
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Get file from Supabase Storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('documents')
      .download(document.file_path)

    if (fileError) {
      console.error('Storage download error:', fileError)
      return NextResponse.json(
        { error: `Failed to download document: ${fileError.message}` },
        { status: 500 }
      )
    }

    if (!fileData) {
      console.error('No file data returned for path:', document.file_path)
      return NextResponse.json(
        { error: 'File not found in storage' },
        { status: 404 }
      )
    }

    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert based on file type
    const fileName = document.file_name.toLowerCase()
    const isDocx = fileName.endsWith('.docx')
    const isDoc = fileName.endsWith('.doc')
    
    if (document.file_type === 'document' || document.mime_type?.includes('word') || isDocx || isDoc) {
      // Check if it's old .doc format (not supported by mammoth)
      if (isDoc && !isDocx) {
        return NextResponse.json(
          { 
            error: 'Legacy .doc format is not supported. Please convert the file to .docx format to edit it.',
            type: 'doc',
            unsupported: true
          },
          { status: 400 }
        )
      }
      
      // DOCX to HTML using mammoth
      try {
        // Mammoth can accept buffer or arrayBuffer
        const result = await mammoth.convertToHtml({ buffer })
        return NextResponse.json({
          type: 'docx',
          content: result.value,
          messages: result.messages,
        })
      } catch (error: any) {
        console.error('Mammoth conversion error:', error)
        // Try with arrayBuffer as fallback
        try {
          const result = await mammoth.convertToHtml({ arrayBuffer })
          return NextResponse.json({
            type: 'docx',
            content: result.value,
            messages: result.messages,
          })
        } catch (fallbackError: any) {
          console.error('Mammoth fallback error:', fallbackError)
          return NextResponse.json(
            { error: `Failed to convert document: ${fallbackError.message}. Please ensure the file is a valid .docx format.` },
            { status: 500 }
          )
        }
      }
    } else if (document.file_type === 'pdf' || document.mime_type === 'application/pdf') {
      // PDF to text (extract text for editing)
      // Note: pdf-lib can get page count, but for text extraction we'll use a client-side approach
      // For now, return a placeholder that allows users to add their own text/notes
      try {
        const pdfDoc = await PDFDocument.load(buffer)
        const pages = pdfDoc.getPages()
        const numPages = pages.length

        // Since pdf-lib doesn't extract text, we'll provide a template
        // The actual text extraction can be done client-side if needed
        const extractedText = `PDF Document with ${numPages} page(s)\n\n[You can add your notes, annotations, or extracted text here. For full text extraction, please use a PDF viewer to copy the text and paste it here.]\n\n--- Start editing below ---\n`

        return NextResponse.json({
          type: 'pdf',
          content: extractedText,
          pageCount: numPages,
          note: 'PDF text extraction is limited. You can manually add text or use a PDF viewer to copy text here.',
        })
      } catch (error: any) {
        console.error('PDF processing error:', error)
        return NextResponse.json(
          { error: `Failed to process PDF: ${error.message}` },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type for editing' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error converting document:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

