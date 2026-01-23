/**
 * Hook for document actions (save, export, load version)
 * 
 * This hook handles all document-related actions including:
 * - Saving document versions
 * - Exporting documents
 * - Loading specific versions
 * 
 * Usage:
 *   const { handleSave, handleExport, loadVersion, saving, exporting } = useDocumentActions({ ... })
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ERROR_MESSAGES, CONSOLE_MESSAGES, DOCUMENT_TYPES, DEFAULT_VALUES } from '@/constants'
import { saveDocumentVersion, exportDocument } from '@/services/api/documents'
import { isErrorWithMessage } from '@/types/documentEditor'
import type {
  DocumentType,
  TipTapEditor,
  UserVersion,
  PDFAnnotation,
} from '@/types/documentEditor'

/**
 * Props for useDocumentActions hook
 */
interface UseDocumentActionsProps {
  /**
   * Document ID
   */
  documentId: string

  /**
   * Current document type (DOCX or PDF)
   */
  documentType: DocumentType

  /**
   * TipTap editor instance (for DOCX documents)
   */
  editor: TipTapEditor

  /**
   * Current content state
   */
  content: string

  /**
   * Current annotations (for PDF documents)
   */
  annotations: PDFAnnotation[]

  /**
   * Version name input value
   */
  versionName: string

  /**
   * Available versions
   */
  versions: UserVersion[]

  /**
   * Ref to track if content is being set (prevents update loops)
   */
  isSettingContentRef: React.MutableRefObject<boolean>

  /**
   * Callback to set content
   */
  setContent: (content: string) => void

  /**
   * Callback to set annotations
   */
  setAnnotations: (annotations: PDFAnnotation[]) => void

  /**
   * Callback to set error
   */
  setError: (error: string | null) => void

  /**
   * Callback to set loading state
   */
  setLoading: (loading: boolean) => void

  /**
   * Callback to reload versions after save
   */
  loadVersions: () => Promise<void>

  /**
   * Callback to close versions panel
   */
  setShowVersions: (show: boolean) => void
}

/**
 * Return type for useDocumentActions hook
 */
interface UseDocumentActionsReturn {
  /**
   * Save the current document version
   */
  handleSave: () => Promise<void>

  /**
   * Export document to specified format
   */
  handleExport: (format: 'docx' | 'pdf') => Promise<void>

  /**
   * Load a specific version
   */
  loadVersion: (version: UserVersion) => Promise<void>

  /**
   * Whether save operation is in progress
   */
  saving: boolean

  /**
   * Whether export operation is in progress
   */
  exporting: boolean
}

/**
 * Hook for managing document actions (save, export, load version)
 * 
 * @param props - Hook configuration props
 * @returns Document action handlers and loading states
 */
export function useDocumentActions({
  documentId,
  documentType,
  editor,
  content,
  annotations,
  versionName,
  versions,
  isSettingContentRef,
  setContent,
  setAnnotations,
  setError,
  setLoading,
  loadVersions,
  setShowVersions,
}: UseDocumentActionsProps): UseDocumentActionsReturn {
  const t = useTranslations('documentEditor')
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  /**
   * Save the current document version
   * 
   * Saves either HTML content (for DOCX) or PDF text content with annotations (for PDF)
   */
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Prepare content based on document type
      let htmlContent: string | null = null
      let pdfTextContent: string | null = null
      let pdfAnnotations: PDFAnnotation[] | null = null

      if (documentType === DOCUMENT_TYPES.DOCX) {
        // For DOCX, get HTML content from editor
        htmlContent = editor?.getHTML() || content
      } else if (documentType === DOCUMENT_TYPES.PDF) {
        // For PDF, save text content and annotations
        pdfTextContent = content
        pdfAnnotations = annotations.length > 0 ? annotations : null
      }

      // Save document version using service layer
      await saveDocumentVersion(documentId, {
        html_content: htmlContent,
        pdf_text_content: pdfTextContent,
        pdf_annotations: pdfAnnotations,
        version_name: versionName || null,
      })

      // Reload versions list and clear version name
      await loadVersions()
      setError(null)
      alert(t('savedSuccessfully'))
    } catch (err) {
      const errorMessage = isErrorWithMessage(err)
        ? err.message
        : ERROR_MESSAGES.SAVE_DOCUMENT
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  /**
   * Export document to specified format (DOCX or PDF)
   * 
   * @param format - Export format ('docx' or 'pdf')
   */
  const handleExport = async (format: 'docx' | 'pdf') => {
    try {
      setExporting(true)
      setError(null)

      // Get latest version
      const latestVersion = versions[0]

      if (!latestVersion) {
        throw new Error(
          t('noVersionToExport') || ERROR_MESSAGES.NO_VERSION_TO_EXPORT
        )
      }

      // Export document using service layer
      const result = await exportDocument(documentId, latestVersion.id, format)

      // Open exported file in new window
      if (result.signedUrl) {
        window.open(result.signedUrl, '_blank')
      }
    } catch (err) {
      const errorMessage = isErrorWithMessage(err)
        ? err.message
        : ERROR_MESSAGES.EXPORT_DOCUMENT
      setError(errorMessage)
    } finally {
      setExporting(false)
    }
  }

  /**
   * Load a specific version into the editor
   * 
   * @param version - Version to load
   */
  const loadVersion = async (version: UserVersion) => {
    try {
      setLoading(true)
      setError(null)

      if (documentType === DOCUMENT_TYPES.DOCX && version.html_content) {
        // Load DOCX version content
        const htmlContent = version.html_content
        if (editor) {
          isSettingContentRef.current = true
          editor.commands.setContent(htmlContent)
          setTimeout(() => {
            isSettingContentRef.current = false
            setContent(htmlContent)
          }, DEFAULT_VALUES.CONTENT_TIMEOUT)
        } else {
          setContent(htmlContent)
        }
      } else if (
        documentType === DOCUMENT_TYPES.PDF &&
        version.pdf_text_content
      ) {
        // Load PDF version content and annotations
        setContent(version.pdf_text_content)
        if (version.pdf_annotations) {
          try {
            const loadedAnnotations = Array.isArray(version.pdf_annotations)
              ? version.pdf_annotations
              : []
            setAnnotations(loadedAnnotations)
          } catch (err) {
            console.error(CONSOLE_MESSAGES.ERROR_LOADING_ANNOTATIONS, err)
            setAnnotations([])
          }
        } else {
          setAnnotations([])
        }
      }

      // Close versions panel
      setShowVersions(false)
    } catch (err) {
      const errorMessage = isErrorWithMessage(err)
        ? err.message
        : ERROR_MESSAGES.LOAD_VERSION
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    handleSave,
    handleExport,
    loadVersion,
    saving,
    exporting,
  }
}

