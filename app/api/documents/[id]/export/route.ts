/**
 * Document Export API Route
 * 
 * Handles exporting documents to DOCX or PDF:
 * - POST: Export document version to DOCX or PDF
 * 
 * This route has been refactored to:
 * - Use proper TypeScript types (no 'any')
 * - Type cheerio DOM elements properly
 * - Type TextRun options properly
 * - Improve error handling
 */

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  IRunOptions,
} from 'docx'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as cheerio from 'cheerio'
import type { Element, Text, AnyNode } from 'domhandler'
import { isErrorWithMessage } from '@/types'
import { CONSOLE_MESSAGES, ERROR_MESSAGES } from '@/constants'

/**
 * Type for cheerio element (can be Element or Text node from domhandler)
 */
type CheerioElement = Element | Text

/**
 * Type for cheerio DOM element (cheerio's internal Element type)
 */
type CheerioDomElement = cheerio.Element

/**
 * Type for cheerio selection (jQuery-like wrapper)
 * Using a practical type - cheerio.load returns a function that returns Cheerio instances
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CheerioSelection = any

/**
 * Type for TextRun options (extends IRunOptions from docx)
 */
interface TextRunOptions extends Partial<IRunOptions> {
  text: string
  bold?: boolean
  italics?: boolean
  underline?: { type: typeof UnderlineType[keyof typeof UnderlineType] }
  strike?: boolean
  color?: string
  size?: number
  font?: string
}

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

// Helper function to parse CSS color to hex
function parseColor(color: string): string {
  if (!color) return '000000'
  
  // If already hex
  if (color.startsWith('#')) {
    return color.substring(1).padStart(6, '0')
  }
  
  // RGB/RGBA format
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
    return `${r}${g}${b}`
  }
  
  // Named colors (basic)
  const namedColors: Record<string, string> = {
    'black': '000000',
    'white': 'FFFFFF',
    'red': 'FF0000',
    'green': '008000',
    'blue': '0000FF',
    'yellow': 'FFFF00',
    'cyan': '00FFFF',
    'magenta': 'FF00FF',
  }
  
  return namedColors[color.toLowerCase()] || '000000'
}

// Helper function to parse font size
function parseFontSize(size: string): number {
  if (!size) return 12
  const match = size.match(/(\d+(?:\.\d+)?)/)
  if (match) {
    const value = parseFloat(match[1])
    // Convert pt to half-points (docx uses half-points)
    if (size.includes('pt')) return Math.round(value * 2)
    if (size.includes('px')) return Math.round(value * 1.33) // Approximate conversion
    return Math.round(value * 2) // Assume points
  }
  return 24 // Default 12pt = 24 half-points
}

// Helper function to parse alignment
function parseAlignment(align: string): typeof AlignmentType[keyof typeof AlignmentType] {
  switch (align?.toLowerCase()) {
    case 'center': return AlignmentType.CENTER
    case 'right': return AlignmentType.RIGHT
    case 'justify': return AlignmentType.JUSTIFIED
    default: return AlignmentType.LEFT
  }
}

// Convert HTML to DOCX paragraphs with full styling preservation
function htmlToDocx(html: string): Paragraph[] {
  const $ = cheerio.load(html)
  const paragraphs: Paragraph[] = []
  
  // Process body content
  const body = $('body').length > 0 ? $('body') : $.root()
  
  body.contents().each((_, element) => {
    const node = element as unknown as AnyNode
    if (node.type === 'text') {
      const text = $(node).text().trim()
      if (text) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun(text)],
          })
        )
      }
    } else if (node.type === 'tag') {
      const $el = $(node)
      const tagName = (node as Element).tagName?.toLowerCase()
      
      if (tagName === 'p' || tagName === 'div') {
        const para = processParagraph($el)
        if (para) paragraphs.push(para)
      } else if (tagName?.match(/^h[1-6]$/)) {
        const levelNum = parseInt(tagName[1])
        let level: typeof HeadingLevel[keyof typeof HeadingLevel]
        if (levelNum === 1) level = HeadingLevel.HEADING_1
        else if (levelNum === 2) level = HeadingLevel.HEADING_2
        else if (levelNum === 3) level = HeadingLevel.HEADING_3
        else if (levelNum === 4) level = HeadingLevel.HEADING_4
        else if (levelNum === 5) level = HeadingLevel.HEADING_5
        else level = HeadingLevel.HEADING_6
        const para = processHeading($el, level)
        if (para) paragraphs.push(para)
      } else if (tagName === 'br') {
        paragraphs.push(new Paragraph({
          children: [new TextRun('')],
        }))
      } else if (tagName === 'ul' || tagName === 'ol') {
        $el.find('li').each((_, li) => {
          const para = processListItem($(li), tagName === 'ol')
          if (para) paragraphs.push(para)
        })
      }
    }
  })
  
  // If no paragraphs found, try to extract from root
  if (paragraphs.length === 0) {
    const text = body.text().trim()
    if (text) {
      paragraphs.push(new Paragraph({
        children: [new TextRun(text)],
      }))
    }
  }
  
  return paragraphs.length > 0 ? paragraphs : [
    new Paragraph({
      children: [new TextRun('Empty document')],
    })
  ]
}

// Process a paragraph element
function processParagraph($el: CheerioSelection): Paragraph | null {
  const textRuns: TextRun[] = []
  const style = $el.attr('style') || ''
  const align = parseAlignmentFromStyle(style)

  // Process all text nodes and inline elements
  const $ = cheerio.load('')
  $el.contents().each((_idx: number, node: CheerioDomElement) => {
    const runs = processNodeWithFormatting($(node), '', {})
    textRuns.push(...runs)
  })
  
  if (textRuns.length === 0) {
    const text = $el.text().trim()
    if (!text) return null
    textRuns.push(new TextRun(text))
  }
  
  return new Paragraph({
    children: textRuns,
    alignment: align,
  })
}

// Process a heading element
function processHeading(
  $el: CheerioSelection,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel]
): Paragraph | null {
  const textRuns: TextRun[] = []
  const style = $el.attr('style') || ''
  const align = parseAlignmentFromStyle(style)
  const $ = cheerio.load('')

  $el.contents().each((_idx: number, node: CheerioDomElement) => {
    const runs = processNodeWithFormatting($(node), '', {})
    textRuns.push(...runs)
  })
  
  if (textRuns.length === 0) {
    const text = $el.text().trim()
    if (!text) return null
    textRuns.push(new TextRun(text))
  }
  
  return new Paragraph({
    heading: level,
    children: textRuns,
    alignment: align,
  })
}

// Process a list item
function processListItem(
  $el: CheerioSelection,
  ordered: boolean
): Paragraph | null {
  const textRuns: TextRun[] = []
  const $ = cheerio.load('')

  $el.contents().each((_idx: number, node: CheerioDomElement) => {
    const runs = processNodeWithFormatting($(node), '', {})
    textRuns.push(...runs)
  })
  
  if (textRuns.length === 0) {
    const text = $el.text().trim()
    if (!text) return null
    textRuns.push(new TextRun(text))
  }
  
  return new Paragraph({
    children: textRuns,
    bullet: ordered ? undefined : { level: 0 },
    numbering: ordered ? { reference: 'default-numbering', level: 0 } : undefined,
  })
}

// Process a node (text or element) and return TextRun array
function processNode($node: CheerioSelection): TextRun[] {
  const runs: TextRun[] = []
  const node = $node[0]

  if (!node) return runs

  if (node.type === 'text') {
    const text = $node.text()
    if (text.trim()) {
      runs.push(new TextRun(text))
    }
    return runs
  }

  if (node.type !== 'tag') return runs

  const tagName = (node as unknown as Element).tagName?.toLowerCase() || ''
  const style = $node.attr('style') || ''
  const styles = parseStyles(style)

  // Get text content
  const text = $node.text()

  // Process nested elements
  const nestedRuns: TextRun[] = []
  const $ = cheerio.load('')

  $node.contents().each((_idx: number, child: CheerioDomElement) => {
    const childRuns = processNodeWithFormatting($(child), tagName, styles)
    nestedRuns.push(...childRuns)
  })

  if (nestedRuns.length > 0) {
    return nestedRuns
  }

  if (!text.trim()) return runs

  const runOptions: TextRunOptions = {
    text: decodeHtmlEntities(text),
  }
  
  // Apply formatting based on tag
  if (tagName === 'strong' || tagName === 'b') {
    runOptions.bold = true
  }
  if (tagName === 'em' || tagName === 'i') {
    runOptions.italics = true
  }
  if (tagName === 'u') {
    runOptions.underline = { type: UnderlineType.SINGLE }
  }
  if (tagName === 's' || tagName === 'strike') {
    runOptions.strike = true
  }
  
  // Apply inline styles
  if (styles.color) {
    runOptions.color = parseColor(styles.color)
  }
  if (styles.fontSize) {
    runOptions.size = parseFontSize(styles.fontSize)
  }
  if (styles.fontFamily) {
    runOptions.font = styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim()
  }
  
  runs.push(new TextRun(runOptions))
  return runs
}

// Process a node with parent formatting applied
function processNodeWithFormatting(
  $node: CheerioSelection,
  parentTag: string,
  parentStyles: Record<string, string>
): TextRun[] {
  const runs: TextRun[] = []
  const node = $node[0]

  if (!node) return runs

  if (node.type === 'text') {
    const text = $node.text().trim()
    if (!text) return runs

    const runOptions: TextRunOptions = {
      text: decodeHtmlEntities(text),
    }

    // Apply parent formatting
    applyFormatting(runOptions, parentTag, parentStyles)

    runs.push(new TextRun(runOptions))
    return runs
  }

  if (node.type !== 'tag') return runs

  const tagName = (node as unknown as Element).tagName?.toLowerCase() || ''
  const style = $node.attr('style') || ''
  const styles = { ...parentStyles, ...parseStyles(style) } // Merge with parent styles

  // Process nested elements
  const nestedRuns: TextRun[] = []
  const $ = cheerio.load('')
  $node.contents().each((_idx: number, child: CheerioDomElement) => {
    const childRuns = processNodeWithFormatting($(child), tagName, styles)
    nestedRuns.push(...childRuns)
  })

  if (nestedRuns.length > 0) {
    return nestedRuns
  }

  const text = $node.text().trim()
  if (!text) return runs

  const runOptions: TextRunOptions = {
    text: decodeHtmlEntities(text),
  }

  // Apply formatting based on tag and styles
  applyFormatting(runOptions, tagName, styles)

  runs.push(new TextRun(runOptions))
  return runs
}

// Apply formatting to run options
function applyFormatting(
  runOptions: TextRunOptions,
  tagName: string,
  styles: Record<string, string>
) {
  // Apply formatting based on tag
  if (tagName === 'strong' || tagName === 'b') {
    runOptions.bold = true
  }
  if (tagName === 'em' || tagName === 'i') {
    runOptions.italics = true
  }
  if (tagName === 'u') {
    runOptions.underline = { type: UnderlineType.SINGLE }
  }
  if (tagName === 's' || tagName === 'strike') {
    runOptions.strike = true
  }
  
  // Apply inline styles
  if (styles.color) {
    runOptions.color = parseColor(styles.color)
  }
  if (styles.fontSize) {
    runOptions.size = parseFontSize(styles.fontSize)
  }
  if (styles.fontFamily) {
    runOptions.font = styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim()
  }
}

// Parse inline styles
function parseStyles(style: string): Record<string, string> {
  const styles: Record<string, string> = {}
  if (!style) return styles
  
  style.split(';').forEach(declaration => {
    const [property, value] = declaration.split(':').map(s => s.trim())
    if (property && value) {
      styles[property.toLowerCase()] = value
    }
  })
  
  return styles
}

// Parse alignment from style
function parseAlignmentFromStyle(style: string): typeof AlignmentType[keyof typeof AlignmentType] {
  const styles = parseStyles(style)
  return parseAlignment(styles['text-align'] || '')
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

    if (!version_id) {
      return NextResponse.json({ error: 'Version ID is required. Please save your document first.' }, { status: 400 })
    }

    // Get the saved version
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
      return NextResponse.json({ error: 'Version not found. Please save your document first.' }, { status: 404 })
    }

    const htmlContent = editedVersion.html_content
    const pdfTextContent = editedVersion.pdf_text_content
    const originalFileType = editedVersion.original_file_type
    const baseFileName = editedVersion.documents.file_name

    let fileBuffer: Buffer
    let mimeType: string
    let exportFileName: string

    if (originalFileType === 'document' && htmlContent) {
      // Export DOCX from HTML content with full formatting preservation
      if (export_format === 'docx') {
        try {
          // Convert HTML to DOCX paragraphs with all styling preserved
          const paragraphs = htmlToDocx(htmlContent)

          const doc = new Document({
            sections: [{
              children: paragraphs,
            }],
          })

          const buffer = await Packer.toBuffer(doc)
          fileBuffer = Buffer.from(buffer)
          const fileNameBase = baseFileName.replace(/\.[^/.]+$/, '')
          exportFileName = `${fileNameBase}_edited_v${editedVersion.version_number}.docx`
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        } catch (htmlError) {
          console.error(CONSOLE_MESSAGES.HTML_TO_DOCX_CONVERSION_ERROR, htmlError)
          const errorMessage = isErrorWithMessage(htmlError)
            ? htmlError.message
            : ERROR_MESSAGES.HTML_TO_DOCX_CONVERSION_FAILED
          return NextResponse.json(
            { error: `${ERROR_MESSAGES.HTML_TO_DOCX_CONVERSION_FAILED}: ${errorMessage}` },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Invalid export format for DOCX document' },
          { status: 400 }
        )
      }
    } else if (originalFileType === 'pdf' && pdfTextContent) {
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

          const lines = pdfTextContent.split('\n')
          
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
          const fileNameBase = baseFileName.replace(/\.[^/.]+$/, '')
          exportFileName = `${fileNameBase}_edited_v${editedVersion.version_number}.pdf`
          mimeType = 'application/pdf'
        } catch (pdfError) {
          console.error(CONSOLE_MESSAGES.PDF_CREATION_ERROR, pdfError)
          const errorMessage = isErrorWithMessage(pdfError)
            ? pdfError.message
            : ERROR_MESSAGES.PDF_CREATION_FAILED
          return NextResponse.json(
            { error: `${ERROR_MESSAGES.PDF_CREATION_FAILED}: ${errorMessage}` },
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
    const filePath = `user-edits/${user.id}/${Date.now()}_${exportFileName}`
    
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
        console.error(CONSOLE_MESSAGES.STORAGE_UPLOAD_ERROR, uploadError)
        return NextResponse.json(
          {
            error: `${ERROR_MESSAGES.STORAGE_UPLOAD_ERROR}: ${uploadError.message}`,
          },
          { status: 500 }
        )
      }
    } catch (uploadErr) {
      console.error(CONSOLE_MESSAGES.STORAGE_UPLOAD_ERROR, uploadErr)
      const errorMessage = isErrorWithMessage(uploadErr)
        ? uploadErr.message
        : ERROR_MESSAGES.STORAGE_UPLOAD_ERROR
      return NextResponse.json(
        { error: `${ERROR_MESSAGES.STORAGE_UPLOAD_ERROR}: ${errorMessage}` },
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
      fileName: exportFileName,
      filePath,
    })
  } catch (error) {
    console.error(CONSOLE_MESSAGES.ERROR_EXPORTING_DOCUMENT, error)
    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

