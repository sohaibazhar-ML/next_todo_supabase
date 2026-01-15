/**
 * Type definitions for Document Editor
 * All types should be properly defined - no 'any' types allowed
 */

import { Editor } from '@tiptap/react'
import { PDFAnnotation } from '../components/document-editor/hooks/usePdfAnnotations'

// Re-export PDFAnnotation for convenience
export type { PDFAnnotation }

// User Version Interface
export interface UserVersion {
  id: string
  version_number: number
  version_name: string | null
  html_content: string | null
  pdf_text_content: string | null
  pdf_annotations: PDFAnnotation[] | null
  created_at: string
  is_draft: boolean
}

// Document Type
export type DocumentType = 'docx' | 'pdf' | null

// PDF.js Text Content Item (from react-pdf/pdfjs)
// TextItem has a 'str' property, TextMarkedContent does not
// Using unknown to work with PDF.js types
export interface PdfTextItem {
  str: string
  dir: string
  width: number
  height: number
  transform: number[]
  fontName: string
  hasEOL: boolean
}

// Type guard to check if an item is a TextItem (has 'str' property)
// Works with PDF.js TextItem | TextMarkedContent union type
export function isTextItem(item: unknown): item is PdfTextItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'str' in item &&
    typeof (item as { str: unknown }).str === 'string'
  )
}

// Editor Type (TipTap Editor)
export type TipTapEditor = Editor | null

// Annotation Tool Types
export type AnnotationTool = 'select' | 'highlight' | 'text' | 'sticky' | null

// Search Result
export interface SearchResult {
  page: number
  text: string
}

// Error Type
export interface ErrorWithMessage {
  message: string
}

// Type guard for ErrorWithMessage
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

