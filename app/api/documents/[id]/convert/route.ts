/**
 * Document Convert API Route
 * 
 * Handles converting documents to editable formats:
 * - GET: Convert document to HTML (DOCX) or provide PDF URL
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { PDFDocument } from 'pdf-lib'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES, STORAGE_BUCKETS, STORAGE_CONFIG } from '@/constants'

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
      .from(STORAGE_BUCKETS.DOCUMENTS)
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

      // DOCX to HTML using mammoth with style preservation
      try {
        // Configure mammoth to preserve inline styles and formatting
        // Mammoth by default preserves inline styles (colors, fonts, sizes) in style attributes
        const styleMap = [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "p[style-name='Heading 5'] => h5:fresh",
          "p[style-name='Heading 6'] => h6:fresh",
          "r[style-name='Strong'] => strong",
          "p[style-name='Quote'] => blockquote:fresh",
          "p[style-name='Intense Quote'] => blockquote:fresh",
        ]

        const options = {
          styleMap,
          includeDefaultStyleMap: true,
          // Preserve all inline styles from the document
          preserveEmptyParagraphs: false,
        }

        // Mammoth can accept buffer or arrayBuffer
        // Mammoth automatically preserves inline styles (color, font-size, font-family, etc.) in style attributes
        const result = await mammoth.convertToHtml({ buffer }, options)
        return NextResponse.json({
          type: 'docx',
          content: result.value,
          messages: result.messages,
        })
      } catch (error) {
        console.error(CONSOLE_MESSAGES.MAMMOTH_CONVERSION_ERROR, error)
        // Try with arrayBuffer as fallback
        try {
          const styleMap = [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='Heading 5'] => h5:fresh",
            "p[style-name='Heading 6'] => h6:fresh",
            "r[style-name='Strong'] => strong",
            "p[style-name='Quote'] => blockquote:fresh",
            "p[style-name='Intense Quote'] => blockquote:fresh",
          ]

          const options = {
            styleMap,
            includeDefaultStyleMap: true,
          }

          const result = await mammoth.convertToHtml({ arrayBuffer }, options)
          return NextResponse.json({
            type: 'docx',
            content: result.value,
            messages: result.messages,
          })
        } catch (fallbackError) {
          console.error(CONSOLE_MESSAGES.MAMMOTH_FALLBACK_ERROR, fallbackError)
          const errorMessage = isErrorWithMessage(fallbackError)
            ? fallbackError.message
            : ERROR_MESSAGES.CONVERT_DOCUMENT_FAILED
          return NextResponse.json(
            {
              error: `${ERROR_MESSAGES.CONVERT_DOCUMENT_FAILED}: ${errorMessage}. Please ensure the file is a valid .docx format.`,
            },
            { status: 500 }
          )
        }
      }
    } else if (document.file_type === 'pdf' || document.mime_type === 'application/pdf') {
      // PDF viewer - get page count and signed URL for viewing
      try {
        const pdfDoc = await PDFDocument.load(buffer)
        const pages = pdfDoc.getPages()
        const numPages = pages.length

        // Get signed URL for PDF viewing
        const { data: urlData, error: urlError } = await supabase.storage
          .from(STORAGE_BUCKETS.DOCUMENTS)
          .createSignedUrl(document.file_path, STORAGE_CONFIG.SIGNED_URL_EXPIRY)

        if (urlError) {
          console.error('Error creating signed URL:', urlError)
          return NextResponse.json(
            { error: `Failed to generate PDF URL: ${urlError.message}` },
            { status: 500 }
          )
        }

        // Since pdf-lib doesn't extract text, we'll provide a template
        // The actual text extraction can be done client-side using pdfjs-dist
        const extractedText = `PDF Document with ${numPages} page(s)\n\n[You can add your notes, annotations, or extracted text here. Text extraction is available in the PDF viewer.]\n\n--- Start editing below ---\n`

        return NextResponse.json({
          type: 'pdf',
          content: extractedText,
          pageCount: numPages,
          pdfUrl: urlData?.signedUrl || null,
          note: 'PDF text extraction is available in the viewer. You can extract text from pages and add annotations.',
        })
      } catch (error) {
        console.error(CONSOLE_MESSAGES.PDF_PROCESSING_ERROR, error)
        const errorMessage = isErrorWithMessage(error)
          ? error.message
          : ERROR_MESSAGES.PDF_PROCESSING_FAILED
        return NextResponse.json(
          { error: `${ERROR_MESSAGES.PDF_PROCESSING_FAILED}: ${errorMessage}` },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type for editing' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_CONVERTING_DOCUMENT, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

