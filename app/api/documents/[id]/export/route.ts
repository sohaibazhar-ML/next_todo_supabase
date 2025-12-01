import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// Function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '…',
    '&mdash;': '—',
    '&ndash;': '–',
  }
  
  // Decode named entities
  let decoded = text
  for (const [entity, char] of Object.entries(entityMap)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  }
  
  // Decode numeric entities (&#123; and &#x1F;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10))
  })
  
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })
  
  return decoded
}

// POST - Export edited document as file (DOCX or PDF)
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

    const { version_id, export_format } = body // 'docx' or 'pdf'

    // Get the edited version
    const editedVersion = await prisma.user_document_versions.findUnique({
      where: { id: version_id },
      include: {
        documents: {
          select: {
            file_name: true,
            file_type: true,
          },
        },
      },
    })

    if (!editedVersion || editedVersion.user_id !== user.id) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    let fileBuffer: Buffer
    let fileName: string
    let mimeType: string

    if (editedVersion.original_file_type === 'document' && editedVersion.html_content) {
      // Export DOCX from HTML content
      if (export_format === 'docx') {
        // Convert HTML to DOCX
        // First, remove HTML tags, then decode HTML entities
        let textContent = editedVersion.html_content
          // Remove HTML tags (but preserve line breaks from block elements)
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<\/div>/gi, '\n')
          .replace(/<\/h[1-6]>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          // Clean up whitespace
          .replace(/\n+/g, '\n')
          .trim()
        
        // Decode HTML entities
        textContent = decodeHtmlEntities(textContent)

        const paragraphs = textContent.split('\n').filter(p => p.trim()).map(
          text => new Paragraph({
            children: [new TextRun(text.trim())],
          })
        )

        const doc = new Document({
          sections: [{
            children: paragraphs.length > 0 ? paragraphs : [
              new Paragraph({
                children: [new TextRun('Empty document')],
              }),
            ],
          }],
        })

        const buffer = await Packer.toBuffer(doc)
        fileBuffer = Buffer.from(buffer)
        fileName = `${editedVersion.documents.file_name.replace(/\.[^/.]+$/, '')}_edited_v${editedVersion.version_number}.docx`
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      } else {
        return NextResponse.json(
          { error: 'Invalid export format for DOCX document' },
          { status: 400 }
        )
      }
    } else if (editedVersion.original_file_type === 'pdf' && editedVersion.pdf_text_content) {
      // Export PDF from text content
      if (export_format === 'pdf') {
        try {
          const pdfDoc = await PDFDocument.create()
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
          const fontSize = 12
          const pageWidth = 612
          const pageHeight = 792
          const margin = 72
          const maxWidth = pageWidth - 2 * margin
          const lineHeight = fontSize * 1.2

          let y = pageHeight - margin
          let page = pdfDoc.addPage([pageWidth, pageHeight])

          const lines = editedVersion.pdf_text_content.split('\n')
          
          // Handle empty content
          if (!lines || lines.length === 0 || lines.every(line => !line.trim())) {
            page.drawText('No content to export', {
              x: margin,
              y: y,
              size: fontSize,
              font: font,
            })
          } else {
            for (const line of lines) {
              if (y < margin) {
                page = pdfDoc.addPage([pageWidth, pageHeight])
                y = pageHeight - margin
              }

              const words = line.split(' ')
              let currentLine = ''
              
              for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word
                const textWidth = font.widthOfTextAtSize(testLine, fontSize)
                
                if (textWidth > maxWidth && currentLine) {
                  page.drawText(currentLine, {
                    x: margin,
                    y: y,
                    size: fontSize,
                    font: font,
                  })
                  y -= lineHeight
                  currentLine = word
                  
                  if (y < margin) {
                    page = pdfDoc.addPage([pageWidth, pageHeight])
                    y = pageHeight - margin
                  }
                } else {
                  currentLine = testLine
                }
              }
              
              if (currentLine) {
                page.drawText(currentLine, {
                  x: margin,
                  y: y,
                  size: fontSize,
                  font: font,
                })
                y -= lineHeight
              } else {
                y -= lineHeight
              }
            }
          }

          const pdfBytes = await pdfDoc.save()
          fileBuffer = Buffer.from(pdfBytes)
          fileName = `${editedVersion.documents.file_name.replace(/\.[^/.]+$/, '')}_edited_v${editedVersion.version_number}.pdf`
          mimeType = 'application/pdf'
        } catch (pdfError: any) {
          console.error('PDF generation error:', pdfError)
          return NextResponse.json(
            { error: `Failed to generate PDF: ${pdfError.message}` },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid export format for PDF document' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'No editable content found for this version' },
        { status: 400 }
      )
    }

    // Upload exported file to Supabase Storage
    const filePath = `user-edits/${user.id}/${Date.now()}_${fileName}`
    
    try {
      // Ensure fileBuffer is a proper Buffer or Uint8Array
      const bufferToUpload = fileBuffer instanceof Buffer ? fileBuffer : Buffer.from(fileBuffer)
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, bufferToUpload, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return NextResponse.json(
          { error: `Failed to upload exported file: ${uploadError.message}` },
          { status: 500 }
        )
      }
    } catch (uploadErr: any) {
      console.error('Upload exception:', uploadErr)
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadErr.message}` },
        { status: 500 }
      )
    }

    // Update version record with exported file info
    await prisma.user_document_versions.update({
      where: { id: version_id },
      data: {
        exported_file_path: filePath,
        exported_file_size: BigInt(fileBuffer.length),
        exported_mime_type: mimeType,
      },
    })

    // Get signed URL for download
    const { data: urlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600)

    if (urlError || !urlData) {
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signedUrl: urlData.signedUrl,
      fileName,
      filePath,
    })
  } catch (error: any) {
    console.error('Error exporting document:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

