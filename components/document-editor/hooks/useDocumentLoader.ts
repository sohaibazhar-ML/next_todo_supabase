/**
 * Hook for loading document content from API
 */

import { useState, useEffect } from 'react'
import { API_ENDPOINTS, CONTENT_TYPES, DEFAULT_VALUES, ERROR_MESSAGES, CONSOLE_MESSAGES, DOCUMENT_TYPES } from '@/constants/documentEditor'
import type { DocumentType, TipTapEditor, UserVersion, PDFAnnotation } from '@/types/documentEditor'
import { isErrorWithMessage } from '@/types/documentEditor'

interface UseDocumentLoaderProps {
  documentId: string
  documentType: DocumentType
  setDocumentType: (type: DocumentType) => void
  setContent: (content: string) => void
  setPdfUrl: (url: string | null) => void
  setNumPages: (pages: number | null) => void
  setPageNumber: (page: number) => void
  setScale: (scale: number) => void
  editor: TipTapEditor
  isSettingContentRef: React.MutableRefObject<boolean>
  versions: UserVersion[]
  setAnnotations: (annotations: PDFAnnotation[]) => void
}

export function useDocumentLoader({
  documentId,
  documentType,
  setDocumentType,
  setContent,
  setPdfUrl,
  setNumPages,
  setPageNumber,
  setScale,
  editor,
  isSettingContentRef,
  versions,
  setAnnotations,
}: UseDocumentLoaderProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDocument = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(API_ENDPOINTS.DOCUMENT_CONVERT(documentId))
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes(CONTENT_TYPES.JSON)) {
        const text = await response.text()
        console.error(CONSOLE_MESSAGES.NON_JSON_RESPONSE, text.substring(0, DEFAULT_VALUES.TEXT_PREVIEW_LENGTH))
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE)
      }
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || ERROR_MESSAGES.LOAD_DOCUMENT)
      }

      setDocumentType(data.type)

      if (data.type === DOCUMENT_TYPES.DOCX) {
        // Set content state and editor content only when loading document
        const htmlContent = data.content || ''
        if (editor) {
          // Set flag to prevent onUpdate from updating state
          isSettingContentRef.current = true
          editor.commands.setContent(htmlContent)
          // Reset flag after a brief delay to allow editor to update
          setTimeout(() => {
            isSettingContentRef.current = false
            setContent(htmlContent)
          }, DEFAULT_VALUES.CONTENT_TIMEOUT)
        } else {
          setContent(htmlContent)
        }
      } else if (data.type === DOCUMENT_TYPES.PDF) {
        // For PDF, set up viewer
        setPdfUrl(data.pdfUrl || null)
        setNumPages(data.pageCount || null)
        setContent(data.content || '')
        setPageNumber(DEFAULT_VALUES.PDF_PAGE_NUMBER)
        setScale(DEFAULT_VALUES.PDF_SCALE)
        // Load annotations from latest version if available
        if (versions.length > 0 && versions[0].pdf_annotations) {
          try {
            const loadedAnnotations = Array.isArray(versions[0].pdf_annotations) 
              ? versions[0].pdf_annotations 
              : []
            setAnnotations(loadedAnnotations)
          } catch (err) {
            console.error(CONSOLE_MESSAGES.ERROR_LOADING_ANNOTATIONS, err)
          }
        }
      }
    } catch (err) {
      const errorMessage = isErrorWithMessage(err) ? err.message : ERROR_MESSAGES.LOAD_DOCUMENT
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocument()
  }, [documentId])

  return { loading, error, loadDocument }
}

