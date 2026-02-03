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
import { DOCUMENT_TYPES, DEFAULT_VALUES } from '@/constants'
import { useDocumentEditorState } from './hooks/useDocumentEditorState'
import { usePdfWorker } from './hooks/usePdfWorker'
import { useDocumentLoader } from './hooks/useDocumentLoader'
import { useVersionManager } from './hooks/useVersionManager'
import { useDocumentActions } from './hooks/useDocumentActions'
import { usePdfHandlers } from './hooks/usePdfHandlers'
import { createEditingSession, finishEditingSession } from '@/actions/google-docs'
import { Button } from '../ui'
import { useState } from 'react'
import { toast } from 'sonner'

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
  
  // Load versions (now handled by React Query in useVersionManager)
  const { versions, loading: versionsLoading } = useVersionManager({
    documentId: document.id,
  })

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
    versions: versions || [],
    setAnnotations: editorState.setAnnotations,
    setLoading: editorState.setLoading,
    setError: editorState.setError,
  })

  // Document actions (save, export, load version)
  const { handleSave, handleExport, loadVersion, saving, exporting } =
    useDocumentActions({
      documentId: document.id,
      documentType: editorState.documentType,
      editor: editor,
      content: editorState.content,
      annotations: editorState.annotations,
      versionName: editorState.versionName,
      versions: versions || [],
      isSettingContentRef: editorState.isSettingContentRef,
      setContent: editorState.setContent,
      setAnnotations: editorState.setAnnotations,
      setError: editorState.setError,
      setLoading: editorState.setLoading,
      loadVersions: async () => {}, // No-op, React Query handles auto-refetching on mutation success
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



// ... imports

// ... inside the component

  // Google Docs Logic
  const [googleLoading, setGoogleLoading] = useState(false)
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)

  const handleStartGoogleSession = async () => {
    if (!document.google_drive_template_id) return
    
    setGoogleLoading(true)
    try {
      const { editUrl, versionId } = await createEditingSession(document.id, document.google_drive_template_id)
      setActiveVersionId(versionId)
      // Open in new tab
      window.open(editUrl, '_blank')
      toast.success('Document opened in new tab')
    } catch (error) {
      console.error(error)
      toast.error('Failed to open document')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleFinishGoogleSession = async () => {
    if (!activeVersionId) return

    setGoogleLoading(true)
    try {
      const result = await finishEditingSession(activeVersionId)
      
      // Automatic download if fileUrl is returned
      if (result.success && result.fileUrl) {
        // Create a temporary link and trigger download
        const link = window.document.createElement('a')
        link.href = result.fileUrl
        link.download = `${document.title || 'Document'}.docx`
        link.target = '_blank'
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
        
        // Wait a bit for the download to start before redirecting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      toast.success('Document saved successfully!')
      
      // Redirect to downloads page
      if (onClose) {
        onClose()
      } else {
        window.location.href = '/downloads'
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to save document')
    } finally {
      setGoogleLoading(false)
    }
  }

  // Check if it's a Google Doc Template
  // Note: We need to ensure 'document' prop has this field. 
  // Assuming the `Document` type is updated to include `google_drive_template_id`.
  const isGoogleDoc = !!document.google_drive_template_id

  if (isGoogleDoc) {
     return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
           <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center space-y-6">
              <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <div>
                 <h2 className="text-2xl font-bold text-gray-900">Edit Document</h2>
                 <p className="text-gray-500 mt-2">
                    This document is managed via Google Docs. Click below to open it in a new tab.
                 </p>
              </div>

              <div className="space-y-3">
                 {!activeVersionId ? (
                   <Button 
                     onClick={handleStartGoogleSession} 
                     disabled={googleLoading}
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                   >
                     {googleLoading ? 'Preparing...' : 'Open in Google Docs'}
                   </Button>
                 ) : (
                   <div className="space-y-4">
                     <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                       Editing in progress... When you are done making changes in the other tab, come back here and click Finish.
                     </div>
                     <Button 
                       onClick={handleFinishGoogleSession}
                       disabled={googleLoading} 
                       className="w-full bg-green-600 hover:bg-green-700 text-white"
                     >
                       {googleLoading ? 'Saving...' : 'Finish & Save DOCX'}
                     </Button>
                     <button 
                       onClick={() => setActiveVersionId(null)}
                       className="text-gray-400 text-sm hover:text-gray-600"
                     >
                       Cancel
                     </button>
                   </div>
                 )}
              </div>
           </div>
           
           <button onClick={onClose} className="mt-8 text-gray-500 hover:text-gray-800">
             Close Editor
           </button>
        </div>
     )
  }

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
        versions={versions || []}
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
          versions={versions || []}
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
