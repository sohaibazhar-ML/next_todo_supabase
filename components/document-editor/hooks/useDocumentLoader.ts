/**
 * Hook for loading document content from API
 */

import { useState, useEffect } from 'react'

interface UseDocumentLoaderProps {
  documentId: string
  documentType: 'docx' | 'pdf' | null
  setDocumentType: (type: 'docx' | 'pdf' | null) => void
  setContent: (content: string) => void
  setPdfUrl: (url: string | null) => void
  setNumPages: (pages: number | null) => void
  setPageNumber: (page: number) => void
  setScale: (scale: number) => void
  editor: any
  isSettingContentRef: React.MutableRefObject<boolean>
  versions: any[]
  setAnnotations: (annotations: any[]) => void
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

      const response = await fetch(`/api/documents/${documentId}/convert`)
      
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
            setAnnotations(loadedAnnotations)
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

  useEffect(() => {
    loadDocument()
  }, [documentId])

  return { loading, error, loadDocument }
}

