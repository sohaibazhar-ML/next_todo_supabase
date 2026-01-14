'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { pdfjs } from 'react-pdf'
import type { Document } from '@/types/document'
import DocumentHeader from './document-editor/DocumentHeader'
import VersionManager from './document-editor/VersionManager'
import DocxEditor from './document-editor/DocxEditor'
import PdfViewer from './document-editor/PdfViewer'
import ErrorMessage from './ui/ErrorMessage'
import LoadingSpinner from './ui/LoadingSpinner'
import { PDFAnnotation } from './document-editor/PdfAnnotationOverlay'

interface DocumentEditorProps {
  document: Document
  onClose?: () => void
}

interface UserVersion {
  id: string
  version_number: number
  version_name: string | null
  html_content: string | null
  pdf_text_content: string | null
  pdf_annotations: any
  created_at: string
  is_draft: boolean
}

export default function DocumentEditor({ document, onClose }: DocumentEditorProps) {
  const t = useTranslations('documentEditor')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [documentType, setDocumentType] = useState<'docx' | 'pdf' | null>(null)
  const [versions, setVersions] = useState<UserVersion[]>([])
  const [versionName, setVersionName] = useState('')
  const [showVersions, setShowVersions] = useState(false)
  const isSettingContentRef = useRef(false)
  
  // PDF viewer state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [workerReady, setWorkerReady] = useState(false)
  
  // Annotation state
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([])
  const [activeTool, setActiveTool] = useState<'select' | 'highlight' | 'text' | 'sticky' | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ page: number; text: string }>>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

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
      if (!isSettingContentRef.current) {
        setContent(editor.getHTML())
      }
    },
  })

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const workerPath = '/pdf.worker.min.mjs'
      pdfjs.GlobalWorkerOptions.workerSrc = workerPath
      
      fetch(workerPath)
        .then(() => {
          console.log('PDF.js worker loaded successfully:', workerPath)
          setWorkerReady(true)
        })
        .catch((err) => {
          console.error('Failed to load worker from', workerPath, 'trying .js:', err)
          const jsWorkerPath = '/pdf.worker.min.js'
          pdfjs.GlobalWorkerOptions.workerSrc = jsWorkerPath
          fetch(jsWorkerPath)
            .then(() => {
              console.log('PDF.js worker loaded from .js:', jsWorkerPath)
              setWorkerReady(true)
            })
            .catch((jsErr) => {
              console.error('Failed to load worker from .js:', jsErr)
              setWorkerReady(true)
            })
        })
    }
  }, [])

  // Load document content
  useEffect(() => {
    loadDocument()
    loadVersions()
  }, [document.id])

  const loadDocument = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/documents/${document.id}/convert`)
      
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Non-JSON response:', text.substring(0, 200))
        throw new Error('Server returned an invalid response. Please try again.')
      }
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load document')
      }

      setDocumentType(data.type)

      if (data.type === 'docx') {
        const htmlContent = data.content || ''
        if (editor) {
          isSettingContentRef.current = true
          editor.commands.setContent(htmlContent)
          setTimeout(() => {
            isSettingContentRef.current = false
            setContent(htmlContent)
          }, 0)
        } else {
          setContent(htmlContent)
        }
      } else if (data.type === 'pdf') {
        setPdfUrl(data.pdfUrl || null)
        setNumPages(data.pageCount || null)
        setContent(data.content || '')
        setPageNumber(1)
        setScale(1.0)
        if (versions.length > 0 && versions[0].pdf_annotations) {
          try {
            const loadedAnnotations = Array.isArray(versions[0].pdf_annotations) 
              ? versions[0].pdf_annotations 
              : []
            setAnnotations(loadedAnnotations as PDFAnnotation[])
          } catch (err) {
            console.error('Error loading annotations:', err)
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }

  const loadVersions = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/edit`)
      if (response.ok) {
        const data = await response.json()
        setVersions(data)
        // Load annotations from latest version if it's a PDF
        if (documentType === 'pdf' && data.length > 0 && data[0].pdf_annotations) {
          try {
            const loadedAnnotations = Array.isArray(data[0].pdf_annotations) 
              ? data[0].pdf_annotations 
              : []
            setAnnotations(loadedAnnotations as PDFAnnotation[])
          } catch (err) {
            console.error('Error loading annotations:', err)
          }
        }
      }
    } catch (err) {
      console.error('Error loading versions:', err)
    }
  }

  // Initialize editor content only once when editor is ready
  useEffect(() => {
    if (editor && documentType === 'docx' && content && !loading) {
      const currentContent = editor.getHTML()
      if (currentContent === '<p></p>' || currentContent === '') {
        isSettingContentRef.current = true
        editor.commands.setContent(content)
        setTimeout(() => {
          isSettingContentRef.current = false
        }, 0)
      }
    }
  }, [editor, documentType, loading])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      let htmlContent: string | null = null
      let pdfTextContent: string | null = null
      let pdfAnnotations: PDFAnnotation[] | null = null

      if (documentType === 'docx') {
        htmlContent = editor?.getHTML() || content
      } else if (documentType === 'pdf') {
        pdfTextContent = content
        pdfAnnotations = annotations.length > 0 ? annotations : null
      }

      const response = await fetch(`/api/documents/${document.id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html_content: htmlContent,
          pdf_text_content: pdfTextContent,
          pdf_annotations: pdfAnnotations,
          version_name: versionName || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save document')
      }

      await loadVersions()
      setVersionName('')
      alert(t('savedSuccessfully'))
    } catch (err: any) {
      setError(err.message || 'Failed to save document')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async (format: 'docx' | 'pdf') => {
    try {
      setExporting(true)
      setError(null)

      const latestVersion = versions[0]
      
      if (!latestVersion) {
        throw new Error(t('noVersionToExport') || 'Please save your document first before exporting')
      }

      const response = await fetch(`/api/documents/${document.id}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version_id: latestVersion.id,
          export_format: format,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to export document')
      }

      window.open(data.signedUrl, '_blank')
    } catch (err: any) {
      setError(err.message || 'Failed to export document')
    } finally {
      setExporting(false)
    }
  }

  const loadVersion = async (version: UserVersion) => {
    try {
      setLoading(true)
      setError(null)

      if (documentType === 'docx' && version.html_content) {
        const htmlContent = version.html_content
        if (editor) {
          isSettingContentRef.current = true
          editor.commands.setContent(htmlContent)
          setTimeout(() => {
            isSettingContentRef.current = false
            setContent(htmlContent)
          }, 0)
        } else {
          setContent(htmlContent)
        }
      } else if (documentType === 'pdf' && version.pdf_text_content) {
        setContent(version.pdf_text_content)
        if (version.pdf_annotations) {
          try {
            const loadedAnnotations = Array.isArray(version.pdf_annotations) 
              ? version.pdf_annotations 
              : []
            setAnnotations(loadedAnnotations as PDFAnnotation[])
          } catch (err) {
            console.error('Error loading annotations:', err)
            setAnnotations([])
          }
        } else {
          setAnnotations([])
        }
      }

      setShowVersions(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load version')
    } finally {
      setLoading(false)
    }
  }

  // Search functionality
  const handleSearch = async () => {
    if (!pdfUrl || !searchQuery.trim()) return
    
    try {
      setPdfLoading(true)
      const loadingTask = pdfjs.getDocument(pdfUrl)
      const pdf = await loadingTask.promise
      const results: Array<{ page: number; text: string }> = []
      
      for (let i = 1; i <= (numPages || 1); i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(' ')
        
        if (pageText.toLowerCase().includes(searchQuery.toLowerCase())) {
          results.push({ page: i, text: pageText })
        }
      }
      
      setSearchResults(results)
      if (results.length > 0) {
        setCurrentSearchIndex(0)
        setPageNumber(results[0].page)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  // Add annotation handler
  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool || activeTool === 'select') return
    
    const pageElement = event.currentTarget.querySelector('.react-pdf__Page')
    if (!pageElement) return
    
    const pageRect = pageElement.getBoundingClientRect()
    const clickX = event.clientX - pageRect.left
    const clickY = event.clientY - pageRect.top
    
    const x = Math.max(0, Math.min(1, clickX / pageRect.width))
    const y = Math.max(0, Math.min(1, clickY / pageRect.height))
    
    if (activeTool === 'highlight') {
      const newAnnotation: PDFAnnotation = {
        id: `annotation-${Date.now()}`,
        page: pageNumber,
        type: 'highlight',
        x: Math.max(0, Math.min(1, x - 0.1)),
        y: Math.max(0, Math.min(1, y - 0.02)),
        width: 0.2,
        height: 0.04,
        color: '#ffff00',
        createdAt: new Date().toISOString(),
      }
      setAnnotations(prev => [...prev, newAnnotation])
      setActiveTool(null)
    } else if (activeTool === 'text' || activeTool === 'sticky') {
      const text = prompt(t('enterAnnotationText') || 'Enter annotation text:')
      if (text) {
        const newAnnotation: PDFAnnotation = {
          id: `annotation-${Date.now()}`,
          page: pageNumber,
          type: activeTool,
          x: Math.max(0, Math.min(1, x)),
          y: Math.max(0, Math.min(1, y)),
          text: text,
          color: activeTool === 'sticky' ? '#ffff00' : '#ffffff',
          createdAt: new Date().toISOString(),
        }
        setAnnotations(prev => [...prev, newAnnotation])
        setActiveTool(null)
      }
    }
  }

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id))
    setSelectedAnnotation(null)
  }

  const handleExtractText = async () => {
    if (!pdfUrl) return
    setPdfLoading(true)
    try {
      const loadingTask = pdfjs.getDocument(pdfUrl)
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      setContent(prev => prev ? `${prev}\n\n--- Page ${pageNumber} ---\n${pageText}` : `--- Page ${pageNumber} ---\n${pageText}`)
    } catch (err) {
      console.error('Error extracting text:', err)
      setError('Failed to extract text from PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleNextResult = () => {
    if (searchResults.length === 0) return
    const nextIndex = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0
    setCurrentSearchIndex(nextIndex)
    setPageNumber(searchResults[nextIndex].page)
  }

  const handlePreviousResult = () => {
    if (searchResults.length === 0) return
    const prevIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1
    setCurrentSearchIndex(prevIndex)
    setPageNumber(searchResults[prevIndex].page)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setCurrentSearchIndex(-1)
  }

  const handleClearAllAnnotations = () => {
    if (confirm(t('clearAllAnnotations') || 'Clear all annotations?')) {
      setAnnotations([])
    }
  }

  if (loading && !content) {
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
        documentType={documentType}
        versions={versions}
        showVersions={showVersions}
        onToggleVersions={() => setShowVersions(!showVersions)}
        onExport={handleExport}
        onSave={handleSave}
        saving={saving}
        exporting={exporting}
        versionName={versionName}
        onVersionNameChange={setVersionName}
        onClose={onClose}
      />

      {showVersions && (
        <VersionManager
          versions={versions}
          onLoadVersion={loadVersion}
        />
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {documentType === 'docx' && editor && (
          <DocxEditor editor={editor} />
        )}

        {documentType === 'pdf' && (
          <PdfViewer
            pdfUrl={pdfUrl}
            numPages={numPages}
            pageNumber={pageNumber}
            scale={scale}
            workerReady={workerReady}
            annotations={annotations}
            activeTool={activeTool}
            selectedAnnotation={selectedAnnotation}
            searchQuery={searchQuery}
            searchResults={searchResults}
            currentSearchIndex={currentSearchIndex}
            pdfLoading={pdfLoading}
            content={content}
            pageRefs={pageRefs}
            onPageChange={setPageNumber}
            onScaleChange={setScale}
            onToolChange={setActiveTool}
            onAnnotationClick={setSelectedAnnotation}
            onDeleteAnnotation={deleteAnnotation}
            onClearAllAnnotations={handleClearAllAnnotations}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            onNextResult={handleNextResult}
            onPreviousResult={handlePreviousResult}
            onExtractText={handleExtractText}
            onContentChange={setContent}
            onPageClick={handlePageClick}
            onNumPagesChange={setNumPages}
          />
        )}
      </div>
    </div>
  )
}
