/**
 * Document Editor Component
 * 
 * Main component for editing documents (DOCX and PDF).
 * Handles document loading, version management, and editing functionality.
 * 
 * This component has been refactored to use custom hooks for better organization:
 * - useDocumentEditorState: Manages all state
 * - usePdfWorker: Initializes PDF.js worker
 * - useDocumentLoader: Loads document content
 * - useVersionManager: Manages document versions
 * - useDocumentActions: Handles save/export/load operations
 * - usePdfHandlers: Handles PDF-specific interactions
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
import DocumentHeader from './document-editor/DocumentHeader'
import VersionManager from './document-editor/VersionManager'
import DocxEditor from './document-editor/DocxEditor'
import PdfViewer from './document-editor/PdfViewer'
import ErrorMessage from './ui/ErrorMessage'
import LoadingSpinner from './ui/LoadingSpinner'
import { DOCUMENT_TYPES } from '@/constants'
import { useDocumentEditorState } from './document-editor/hooks/useDocumentEditorState'
import { usePdfWorker } from './document-editor/hooks/usePdfWorker'
import { useDocumentLoader } from './document-editor/hooks/useDocumentLoader'
import { useVersionManager } from './document-editor/hooks/useVersionManager'
import { useDocumentActions } from './document-editor/hooks/useDocumentActions'
import { usePdfHandlers } from './document-editor/hooks/usePdfHandlers'

interface DocumentEditorProps {
  document: Document
  onClose?: () => void
}

export default function DocumentEditor({ document, onClose }: DocumentEditorProps) {
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

  // Load versions (using external state management)
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
          <DocxEditor editor={editor} />
        )}

        {editorState.documentType === DOCUMENT_TYPES.PDF && (
          <PdfViewer
            pdfUrl={editorState.pdfUrl}
            numPages={editorState.numPages}
            pageNumber={editorState.pageNumber}
            scale={editorState.scale}
            workerReady={workerReady}
            annotations={editorState.annotations}
            activeTool={editorState.activeTool}
            selectedAnnotation={editorState.selectedAnnotation}
            searchQuery={editorState.searchQuery}
            searchResults={editorState.searchResults}
            currentSearchIndex={editorState.currentSearchIndex}
            pdfLoading={editorState.pdfLoading}
            content={editorState.content}
            pageRefs={editorState.pageRefs}
            onPageChange={editorState.setPageNumber}
            onScaleChange={editorState.setScale}
            onToolChange={editorState.setActiveTool}
            onAnnotationClick={editorState.setSelectedAnnotation}
            onDeleteAnnotation={pdfHandlers.deleteAnnotation}
            onClearAllAnnotations={pdfHandlers.handleClearAllAnnotations}
            onSearchQueryChange={editorState.setSearchQuery}
            onSearch={pdfHandlers.handleSearch}
            onClearSearch={pdfHandlers.handleClearSearch}
            onNextResult={pdfHandlers.handleNextResult}
            onPreviousResult={pdfHandlers.handlePreviousResult}
            onExtractText={pdfHandlers.handleExtractText}
            onContentChange={editorState.setContent}
            onPageClick={pdfHandlers.handlePageClick}
            onNumPagesChange={editorState.setNumPages}
          />
        )}
      </div>
    </div>
  )
}
