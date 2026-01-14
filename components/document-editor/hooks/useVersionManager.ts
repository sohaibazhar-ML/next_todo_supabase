/**
 * Hook for managing document versions
 */

import { useState, useEffect } from 'react'

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

interface UseVersionManagerProps {
  documentId: string
}

export function useVersionManager({ documentId }: UseVersionManagerProps) {
  const [versions, setVersions] = useState<UserVersion[]>([])
  const [loading, setLoading] = useState(false)

  const loadVersions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/documents/${documentId}/edit`)
      if (response.ok) {
        const data = await response.json()
        setVersions(data)
      }
    } catch (err) {
      console.error('Error loading versions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVersions()
  }, [documentId])

  return { versions, loading, loadVersions }
}

