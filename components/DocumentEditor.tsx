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
import type { Document } from '@/types/document'

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
        // For PDF, we'll show a text editor
        setContent(data.content || '')
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

      if (documentType === 'docx') {
        htmlContent = editor?.getHTML() || content
      } else if (documentType === 'pdf') {
        pdfTextContent = content
      }

      const response = await fetch(`/api/documents/${document.id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html_content: htmlContent,
          pdf_text_content: pdfTextContent,
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
      }

      setShowVersions(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load version')
    } finally {
      setLoading(false)
    }
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
            <div className="p-8">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-500 bg-white"
                placeholder={t('pdfEditorPlaceholder')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

