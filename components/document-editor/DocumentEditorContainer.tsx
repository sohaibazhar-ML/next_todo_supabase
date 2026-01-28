/**
 * Document Editor Container
 * 
 * Main orchestration component for document editing.
 * Handles state management, document loading, and routing between PDF/DOCX editors.
 * 
 * Responsibilities:
 * - Initialize editor state and hooks
 * - Load document content
 * - Manage versions
 * - Route to appropriate editor (PDF or DOCX)
 */

'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import type { Document } from '@/types/document'
import DocumentHeader from './DocumentHeader'
import VersionManager from './VersionManager'
import DocxEditorView from './DocxEditorView'
import PdfEditorView from './PdfEditorView'
import ErrorMessage from '../ui/ErrorMessage'
import LoadingSpinner from '../ui/LoadingSpinner'
import { DOCUMENT_TYPES } from '@/constants'
import { useDocumentEditorState } from './hooks/useDocumentEditorState'
import { usePdfWorker } from './hooks/usePdfWorker'
import { useDocumentLoader } from './hooks/useDocumentLoader'
import { useVersionManager } from './hooks/useVersionManager'
import { useDocumentActions } from './hooks/useDocumentActions'
import { usePdfHandlers } from './hooks/usePdfHandlers'

interface DocumentEditorContainerProps {
  document: Document
  onClose?: () => void
}

export default function DocumentEditorContainer({ 
  document, 
  onClose 
}: DocumentEditorContainerProps) {
  const t = useTranslations('documentEditor')

  // Get all state from centralized hook
  const editorState = useDocumentEditorState()

  // Initialize PDF.js worker
  const { workerReady } = usePdfWorker()

  // TipTap editor for DOCX
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: '',
    immediatelyRender: false,
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onUpdate: ({ editor }) => {
      if (!editorState.isSettingContentRef.current) {
        editorState.setContent(editor.getHTML())
      }
    },
  })

  // Load document content
  useDocumentLoader({
    documentId: document.id,
    documentType: editorState.documentType,
    setDocumentType: editorState.setDocumentType,
    setContent: editorState.setContent,
    setPdfUrl: editorState.setPdfUrl,
    setNumPages: editorState.setNumPages,
    setPageNumber: editorState.setPageNumber,
    setScale: editorState.setScale,
    editor: editor,
    isSettingContentRef: editorState.isSettingContentRef,
    versions: editorState.versions,
    setAnnotations: editorState.setAnnotations,
    setLoading: editorState.setLoading,
    setError: editorState.setError,
  })

  // Load versions
  const { loadVersions } = useVersionManager({
    documentId: document.id,
    setVersions: editorState.setVersions,
  })

  // Load versions on mount and when document changes
  useEffect(() => {
    loadVersions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.id])

  // Document actions (save, export, load version)
  const { handleSave, handleExport, loadVersion, saving, exporting } =
    useDocumentActions({
      documentId: document.id,
      documentType: editorState.documentType,
      editor: editor,
      content: editorState.content,
      annotations: editorState.annotations,
      versionName: editorState.versionName,
      versions: editorState.versions,
      isSettingContentRef: editorState.isSettingContentRef,
      setContent: editorState.setContent,
      setAnnotations: editorState.setAnnotations,
      setError: editorState.setError,
      setLoading: editorState.setLoading,
      loadVersions: async () => {
        await loadVersions()
      },
      setShowVersions: editorState.setShowVersions,
    })

  // PDF-specific handlers
  const pdfHandlers = usePdfHandlers({
    pdfUrl: editorState.pdfUrl,
    pageNumber: editorState.pageNumber,
    numPages: editorState.numPages,
    searchQuery: editorState.searchQuery,
    searchResults: editorState.searchResults,
    currentSearchIndex: editorState.currentSearchIndex,
    activeTool: editorState.activeTool,
    annotations: editorState.annotations,
    setPdfLoading: editorState.setPdfLoading,
    setContent: editorState.setContent,
    setError: editorState.setError,
    setAnnotations: editorState.setAnnotations,
    setActiveTool: editorState.setActiveTool,
    setSelectedAnnotation: editorState.setSelectedAnnotation,
    setPageNumber: editorState.setPageNumber,
    setSearchResults: editorState.setSearchResults,
    setCurrentSearchIndex: editorState.setCurrentSearchIndex,
    setSearchQuery: editorState.setSearchQuery,
  })

  // Initialize editor content only once when editor is ready
  useEffect(() => {
    if (
      editor &&
      editorState.documentType === DOCUMENT_TYPES.DOCX &&
      editorState.content &&
      !editorState.loading
    ) {
      const currentContent = editor.getHTML()
      if (currentContent === '<p></p>' || currentContent === '') {
        editorState.isSettingContentRef.current = true
        editor.commands.setContent(editorState.content)
        setTimeout(() => {
          editorState.isSettingContentRef.current = false
        }, 0)
      }
    }
  }, [editor, editorState.documentType, editorState.loading, editorState.content])

  // Loading state
  if (editorState.loading && !editorState.content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text={t('loading')} size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DocumentHeader
        document={document}
        documentType={editorState.documentType}
        versions={editorState.versions}
        showVersions={editorState.showVersions}
        onToggleVersions={() => editorState.setShowVersions(!editorState.showVersions)}
        onExport={handleExport}
        onSave={handleSave}
        saving={saving}
        exporting={exporting}
        versionName={editorState.versionName}
        onVersionNameChange={editorState.setVersionName}
        onClose={onClose}
      />

      {editorState.showVersions && (
        <VersionManager
          versions={editorState.versions}
          onLoadVersion={loadVersion}
        />
      )}

      {editorState.error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ErrorMessage
            message={editorState.error}
            onDismiss={() => editorState.setError(null)}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {editorState.documentType === DOCUMENT_TYPES.DOCX && editor && (
          <DocxEditorView editor={editor} />
        )}

        {editorState.documentType === DOCUMENT_TYPES.PDF && (
          <PdfEditorView
            editorState={editorState}
            workerReady={workerReady}
            pdfHandlers={pdfHandlers}
          />
        )}
      </div>
    </div>
  )
}
