/**
 * Hook for loading document content from API
 * 
 * This hook handles loading document content and converting it to an editable format.
 * It supports both DOCX (converted to HTML) and PDF (with viewer setup).
 * 
 * Usage:
 *   useDocumentLoader({
 *     documentId,
 *     setLoading,
 *     setError,
 *     setDocumentType,
 *     // ... other setters
 *   })
 */

import { useEffect } from 'react'
import { CONTENT_TYPES, DEFAULT_VALUES, ERROR_MESSAGES, CONSOLE_MESSAGES, DOCUMENT_TYPES } from '@/constants'
import { convertDocumentForEditor } from '@/services/api/documents'
import type { DocumentType, TipTapEditor, UserVersion, PDFAnnotation } from '@/types/documentEditor'
import { isErrorWithMessage } from '@/types/documentEditor'

interface UseDocumentLoaderProps {
  /**
   * Document ID to load
   */
  documentId: string

  /**
   * Current document type
   */
  documentType: DocumentType

  /**
   * Callback to set document type
   */
  setDocumentType: (type: DocumentType) => void

  /**
   * Callback to set content
   */
  setContent: (content: string) => void

  /**
   * Callback to set PDF URL
   */
  setPdfUrl: (url: string | null) => void

  /**
   * Callback to set number of pages
   */
  setNumPages: (pages: number | null) => void

  /**
   * Callback to set page number
   */
  setPageNumber: (page: number) => void

  /**
   * Callback to set scale
   */
  setScale: (scale: number) => void

  /**
   * TipTap editor instance
   */
  editor: TipTapEditor

  /**
   * Ref to track if content is being set
   */
  isSettingContentRef: React.MutableRefObject<boolean>

  /**
   * Available versions
   */
  versions: UserVersion[]

  /**
   * Callback to set annotations
   */
  setAnnotations: (annotations: PDFAnnotation[]) => void

  /**
   * Callback to set loading state
   */
  setLoading: (loading: boolean) => void

  /**
   * Callback to set error state
   */
  setError: (error: string | null) => void
}

/**
 * Hook for loading document content from API
 * 
 * Automatically loads document when documentId changes.
 * Uses external state management for loading and error states.
 * 
 * @param props - Hook configuration
 */
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
  setLoading,
  setError,
}: UseDocumentLoaderProps) {
  /**
   * Load document content from API
   */
  const loadDocument = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await convertDocumentForEditor(documentId)

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
      const errorMessage = isErrorWithMessage(err)
        ? err.message
        : ERROR_MESSAGES.LOAD_DOCUMENT
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Load document when documentId changes
  useEffect(() => {
    loadDocument()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])
}

