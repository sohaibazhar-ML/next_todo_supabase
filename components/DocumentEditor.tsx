'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf'
import type { Document } from '@/types/document'

// Note: react-pdf v10 includes styles automatically, but if needed, you can import:
// The CSS files are optional in v10 and may cause build issues in Next.js
// If styling is needed, add custom CSS or use the built-in styles

// Set up PDF.js worker for Next.js - must be set before any PDF operations
// We'll set it in useEffect to ensure it's initialized properly

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

interface PDFAnnotation {
  id: string
  page: number
  type: 'highlight' | 'text' | 'drawing' | 'sticky'
  x: number // X coordinate (0-1 normalized)
  y: number // Y coordinate (0-1 normalized)
  width?: number // Width for highlights/drawings
  height?: number // Height for highlights/drawings
  text?: string // Text content for text/sticky notes
  color?: string // Color for highlights/drawings
  points?: Array<{ x: number; y: number }> // For drawings
  createdAt: string
}

export default function DocumentEditor({ document, onClose }: DocumentEditorProps) {
  const t = useTranslations('documentEditor')
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [documentType, setDocumentType] = useState<'docx' | 'pdf' | null>(null)
  const [versions, setVersions] = useState<UserVersion[]>([])
  const [versionName, setVersionName] = useState('')
  const [showVersions, setShowVersions] = useState(false)
  const isSettingContentRef = useRef(false) // Flag to prevent cursor jumping when programmatically setting content
  
  // PDF viewer state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [extractedText, setExtractedText] = useState<string>('')
  const [workerReady, setWorkerReady] = useState(false)
  
  // Annotation state
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([])
  const [activeTool, setActiveTool] = useState<'select' | 'highlight' | 'text' | 'sticky' | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ page: number; text: string }>>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // TipTap editor for DOCX with style preservation
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable default heading styles to preserve document styles
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextStyle, // Required for Color extension
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
      // Only update content state if we're not programmatically setting content
      if (!isSettingContentRef.current) {
        setContent(editor.getHTML())
      }
    },
  })


  // Initialize PDF.js worker - must be done before loading PDFs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use local worker file from public folder
      // Try .mjs first, then .js as fallback
      const workerPath = '/pdf.worker.min.mjs'
      pdfjs.GlobalWorkerOptions.workerSrc = workerPath
      
      // Verify worker can be loaded
      fetch(workerPath)
        .then(() => {
          console.log('PDF.js worker loaded successfully:', workerPath)
          setWorkerReady(true)
        })
        .catch((err) => {
          console.error('Failed to load worker from', workerPath, 'trying .js:', err)
          // Fallback to .js
          const jsWorkerPath = '/pdf.worker.min.js'
          pdfjs.GlobalWorkerOptions.workerSrc = jsWorkerPath
          fetch(jsWorkerPath)
            .then(() => {
              console.log('PDF.js worker loaded from .js:', jsWorkerPath)
              setWorkerReady(true)
            })
            .catch((jsErr) => {
              console.error('Failed to load worker from .js:', jsErr)
              setWorkerReady(true) // Still try to proceed
            })
        })
    }
  }, [])

  // Load document content
  useEffect(() => {
    loadDocument()
    loadVersions()
  }, [document.id])

  // Re-load PDF document once worker is ready (if it's a PDF)
  useEffect(() => {
    if (documentType === 'pdf' && workerReady && pdfUrl) {
      // Worker is ready, PDF should now work
      // The PDFDocument component will handle the rendering
    }
  }, [workerReady, documentType, pdfUrl])

  const loadDocument = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/documents/${document.id}/convert`)
      
      // Check if response is JSON
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
          }, 0)
        } else {
          setContent(htmlContent)
        }
      } else if (data.type === 'pdf') {
        // For PDF, set up viewer
        setPdfUrl(data.pdfUrl || null)
        setNumPages(data.pageCount || null)
        setContent(data.content || '')
        setPageNumber(1)
        setScale(1.0)
        // Load annotations from latest version if available
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
      }
    } catch (err) {
      console.error('Error loading versions:', err)
    }
  }

  // Initialize editor content only once when editor is ready (only for initial load)
  useEffect(() => {
    if (editor && documentType === 'docx' && content && !loading) {
      const currentContent = editor.getHTML()
      // Only set content if editor is empty (initial state)
      if (currentContent === '<p></p>' || currentContent === '') {
        isSettingContentRef.current = true
        editor.commands.setContent(content)
        setTimeout(() => {
          isSettingContentRef.current = false
        }, 0)
      }
    }
  }, [editor, documentType, loading]) // Removed 'content' from dependencies to prevent re-setting on every keystroke

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

      // Reload versions
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

      // Get the latest saved version - user must save before exporting
      const latestVersion = versions[0]
      
      if (!latestVersion) {
        throw new Error(t('noVersionToExport') || 'Please save your document first before exporting')
      }

      // Export the latest saved version
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

      // Download the file
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
          // Set flag to prevent cursor jumping
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
        // Load annotations if available
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
    
    // Find the PDF page element
    const pageElement = event.currentTarget.querySelector('.react-pdf__Page')
    if (!pageElement) return
    
    const pageRect = pageElement.getBoundingClientRect()
    const clickX = event.clientX - pageRect.left
    const clickY = event.clientY - pageRect.top
    
    // Normalize coordinates (0-1) based on page dimensions
    const x = Math.max(0, Math.min(1, clickX / pageRect.width))
    const y = Math.max(0, Math.min(1, clickY / pageRect.height))
    
    if (activeTool === 'highlight') {
      // For highlight, we'll create a simple rectangle
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
      setActiveTool(null) // Reset tool after adding
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
        setActiveTool(null) // Reset tool after adding
      }
    }
  }

  // Delete annotation
  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id))
    setSelectedAnnotation(null)
  }

  if (loading && !content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose || (() => router.back())}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{document.title}</h1>
                <p className="text-sm text-gray-500">{document.file_type}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {versions.length > 0 && (
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                >
                  {t('myVersions')} ({versions.length})
                </button>
              )}
              {documentType === 'docx' && (
                <button
                  onClick={() => handleExport('docx')}
                  disabled={exporting || versions.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={versions.length === 0 ? t('noVersionToExport') || 'Please save first' : ''}
                >
                  {exporting ? t('exporting') : t('exportDocx')}
                </button>
              )}
              {documentType === 'pdf' && (
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting || versions.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={versions.length === 0 ? t('noVersionToExport') || 'Please save first' : ''}
                >
                  {exporting ? t('exporting') : t('exportPdf')}
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? t('saving') : t('save')}
              </button>
            </div>
          </div>

          {/* Version name input */}
          <div className="mt-4">
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder={t('versionNamePlaceholder')}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Versions dropdown */}
      {showVersions && versions.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">{t('selectVersion')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => loadVersion(version)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {t('version')} {version.version_number}
                    {version.version_name && ` - ${version.version_name}`}
                  </div>
                  <div className="text-xs text-gray-700 mt-1">
                    {new Date(version.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Editor content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {documentType === 'docx' && editor && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Text Formatting */}
                <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1.5 text-sm rounded font-semibold transition-colors ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1.5 text-sm rounded italic transition-colors ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`px-3 py-1.5 text-sm rounded underline transition-colors ${editor.isActive('underline') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Underline"
                  >
                    U
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`px-3 py-1.5 text-sm rounded line-through transition-colors ${editor.isActive('strike') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Strikethrough"
                  >
                    S
                  </button>
                </div>

                {/* Text Alignment */}
                <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Align Left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Align Center"
                  >
                    ↔
                  </button>
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Align Right"
                  >
                    →
                  </button>
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Justify"
                  >
                    ≡
                  </button>
                </div>

                {/* Headings */}
                <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`px-3 py-1.5 text-sm rounded font-bold transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1.5 text-sm rounded font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-3 py-1.5 text-sm rounded font-bold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Heading 3"
                  >
                    H3
                  </button>
                </div>

                {/* Lists */}
                <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
                  <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Bullet List"
                  >
                    •
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
                    title="Numbered List"
                  >
                    1.
                  </button>
                </div>

                {/* Text Color */}
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                    title="Text Color"
                  />
                  <button
                    onClick={() => editor.chain().focus().unsetColor().run()}
                    className="px-3 py-1.5 text-sm rounded text-gray-900 hover:bg-gray-100 transition-colors"
                    title="Remove Color"
                  >
                    🎨
                  </button>
                </div>
              </div>
            </div>
            <div className="p-8 min-h-[600px] prose prose-sm max-w-none text-gray-900">
              <EditorContent editor={editor} />
            </div>
          </div>
        )}

        {documentType === 'pdf' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Annotation Tools */}
            <div className="border-b border-gray-200 p-3 bg-indigo-50">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700 mr-2">{t('annotationTools') || 'Tools:'}</span>
                <button
                  onClick={() => setActiveTool(activeTool === 'select' ? null : 'select')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTool === 'select' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  title={t('selectTool') || 'Select'}
                >
                  {t('select') || 'Select'}
                </button>
                <button
                  onClick={() => setActiveTool(activeTool === 'highlight' ? null : 'highlight')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTool === 'highlight' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  title={t('highlightTool') || 'Highlight'}
                >
                  {t('highlight') || 'Highlight'}
                </button>
                <button
                  onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTool === 'text' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  title={t('textAnnotation') || 'Text Annotation'}
                >
                  {t('textNote') || 'Text'}
                </button>
                <button
                  onClick={() => setActiveTool(activeTool === 'sticky' ? null : 'sticky')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTool === 'sticky' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  title={t('stickyNote') || 'Sticky Note'}
                >
                  {t('sticky') || 'Sticky'}
                </button>
                {annotations.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm(t('clearAllAnnotations') || 'Clear all annotations?')) {
                        setAnnotations([])
                      }
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                    title={t('clearAnnotations') || 'Clear All Annotations'}
                  >
                    {t('clear') || 'Clear'}
                  </button>
                )}
              </div>
            </div>

            {/* PDF Viewer Controls */}
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Page Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                    disabled={pageNumber <= 1}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← {t('previous') || 'Previous'}
                  </button>
                  <span className="text-sm text-gray-700">
                    {t('page') || 'Page'} {pageNumber} {numPages !== null && `of ${numPages}`}
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={numPages || 1}
                    value={pageNumber}
                    onChange={(e) => {
                      const page = parseInt(e.target.value)
                      if (page >= 1 && page <= (numPages || 1)) {
                        setPageNumber(page)
                      }
                    }}
                    className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900"
                  />
                  <button
                    onClick={() => setPageNumber(prev => Math.min(numPages || 1, prev + 1))}
                    disabled={pageNumber >= (numPages || 1)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('next') || 'Next'} →
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScale(prev => Math.max(0.5, prev - 0.25))}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <span className="text-sm text-gray-700 min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() => setScale(prev => Math.min(2.0, prev + 0.25))}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setScale(1.0)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Reset Zoom"
                  >
                    {t('reset') || 'Reset'}
                  </button>
                </div>

                {/* Extract Text Button */}
                <button
                  onClick={async () => {
                    if (!pdfUrl) return
                    setPdfLoading(true)
                    try {
                      // Extract text from current page using pdfjs
                      const loadingTask = pdfjs.getDocument(pdfUrl)
                      const pdf = await loadingTask.promise
                      const page = await pdf.getPage(pageNumber)
                      const textContent = await page.getTextContent()
                      const pageText = textContent.items.map((item: any) => item.str).join(' ')
                      setExtractedText(prev => prev ? `${prev}\n\n--- Page ${pageNumber} ---\n${pageText}` : `--- Page ${pageNumber} ---\n${pageText}`)
                      setContent(prev => prev ? `${prev}\n\n--- Page ${pageNumber} ---\n${pageText}` : `--- Page ${pageNumber} ---\n${pageText}`)
                    } catch (err) {
                      console.error('Error extracting text:', err)
                      setError('Failed to extract text from PDF')
                    } finally {
                      setPdfLoading(false)
                    }
                  }}
                  disabled={pdfLoading || !pdfUrl}
                  className="px-4 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pdfLoading ? t('extracting') || 'Extracting...' : t('extractText') || 'Extract Text'}
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchInPdf') || 'Search in PDF...'}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      handleSearch()
                    }
                  }}
                />
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim()}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('search') || 'Search'}
                </button>
                {searchResults.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {t('found') || 'Found'} {searchResults.length} {t('results') || 'results'}
                    {currentSearchIndex >= 0 && ` (${currentSearchIndex + 1}/${searchResults.length})`}
                  </span>
                )}
                {searchResults.length > 0 && (
                  <>
                    <button
                      onClick={() => {
                        const prevIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1
                        setCurrentSearchIndex(prevIndex)
                        setPageNumber(searchResults[prevIndex].page)
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => {
                        const nextIndex = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0
                        setCurrentSearchIndex(nextIndex)
                        setPageNumber(searchResults[nextIndex].page)
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setSearchResults([])
                        setCurrentSearchIndex(-1)
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="p-4 bg-gray-100 overflow-auto" style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '600px' }}>
              {pdfUrl && workerReady ? (
                <div className="flex justify-center">
                  <div 
                    className="relative"
                    onClick={handlePageClick}
                    ref={(el) => {
                      if (el) pageRefs.current.set(pageNumber, el)
                    }}
                  >
                    <PDFDocument
                      file={pdfUrl}
                      loading={
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">{t('loading')}</p>
                          </div>
                        </div>
                      }
                      onLoadSuccess={({ numPages }) => {
                        setNumPages(numPages)
                      }}
                      onLoadError={(error) => {
                        console.error('PDF load error:', error)
                        setError('Failed to load PDF. Please try again.')
                      }}
                      error={
                        <div className="p-8 text-center">
                          <p className="text-red-600">{t('pdfLoadError') || 'Failed to load PDF'}</p>
                        </div>
                      }
                    >
                      <div className="relative">
                        <PDFPage
                          pageNumber={pageNumber}
                          scale={scale}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          className="shadow-lg"
                        />
                        {/* Annotation Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          {annotations
                            .filter(ann => ann.page === pageNumber)
                            .map(annotation => {
                              const pageElement = pageRefs.current.get(pageNumber)?.querySelector('.react-pdf__Page')
                              if (!pageElement) return null
                              
                              const rect = pageElement.getBoundingClientRect()
                              const left = annotation.x * rect.width
                              const top = annotation.y * rect.height
                              
                              return (
                                <div
                                  key={annotation.id}
                                  className="absolute pointer-events-auto"
                                  style={{
                                    left: `${left}px`,
                                    top: `${top}px`,
                                    width: annotation.width ? `${annotation.width * rect.width}px` : 'auto',
                                    height: annotation.height ? `${annotation.height * rect.height}px` : 'auto',
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedAnnotation(annotation.id)
                                  }}
                                >
                                  {annotation.type === 'highlight' && (
                                    <div
                                      className="absolute opacity-30 rounded"
                                      style={{
                                        backgroundColor: annotation.color || '#ffff00',
                                        width: '100%',
                                        height: '100%',
                                      }}
                                    />
                                  )}
                                  {(annotation.type === 'text' || annotation.type === 'sticky') && (
                                    <div
                                      className="absolute p-2 rounded shadow-lg border-2 border-gray-400 min-w-[150px] max-w-[250px]"
                                      style={{
                                        backgroundColor: annotation.color || '#ffffff',
                                        zIndex: selectedAnnotation === annotation.id ? 1000 : 100,
                                      }}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs text-gray-800 break-words">{annotation.text}</p>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            deleteAnnotation(annotation.id)
                                          }}
                                          className="text-red-600 hover:text-red-800 text-xs font-bold"
                                          title={t('delete') || 'Delete'}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    </PDFDocument>
                  </div>
                </div>
              ) : pdfUrl && !workerReady ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('loadingWorker') || 'Loading PDF worker...'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <p className="text-gray-600">{t('noPdfUrl') || 'PDF URL not available'}</p>
                </div>
              )}
            </div>

            {/* Text Editor for Notes and Extracted Text */}
            <div className="border-t border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('notesAndExtractedText') || 'Notes and Extracted Text'}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-500 bg-white"
                placeholder={t('pdfEditorPlaceholder')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

