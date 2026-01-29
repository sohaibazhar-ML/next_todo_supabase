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
import { CONTENT_TYPES, DEFAULT_VALUES, CONSOLE_MESSAGES, DOCUMENT_TYPES } from '@/constants'
import { useConvertDocumentForEditor } from '@/hooks/api/useDocuments'
import type { DocumentType, TipTapEditor, UserVersion, PDFAnnotation } from '@/types/documentEditor'

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
  // React Query for loading document
  const { data, isLoading, error: loadError } = useConvertDocumentForEditor(documentId)

  // Sync loading and error states
  useEffect(() => {
    setLoading(isLoading)
    setError(loadError ? (loadError as Error).message : null)
  }, [isLoading, loadError, setLoading, setError])

  // Effect to handle loaded data
  useEffect(() => {
    if (!data) return

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
            ? versions[0].pdf_annotations as unknown as PDFAnnotation[]
            : []
          setAnnotations(loadedAnnotations)
        } catch (err) {
          console.error(CONSOLE_MESSAGES.ERROR_LOADING_ANNOTATIONS, err)
        }
      }
    }
  }, [
    data,
    editor,
    setDocumentType,
    setContent,
    setPdfUrl,
    setNumPages,
    setPageNumber,
    setScale,
    isSettingContentRef,
    setAnnotations,
    versions, // Keep versions in dependency for PDF annotations
  ])
}

