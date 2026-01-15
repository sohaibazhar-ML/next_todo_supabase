/**
 * Hook for managing document versions
 */

import { useState, useEffect } from 'react'
import { API_ENDPOINTS, CONSOLE_MESSAGES } from '@/constants/documentEditor'
import type { UserVersion } from '@/types/documentEditor'

interface UseVersionManagerProps {
  documentId: string
}

export function useVersionManager({ documentId }: UseVersionManagerProps) {
  const [versions, setVersions] = useState<UserVersion[]>([])
  const [loading, setLoading] = useState(false)

  const loadVersions = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_ENDPOINTS.DOCUMENT_EDIT(documentId))
      if (response.ok) {
        const data = await response.json()
        setVersions(data)
      }
    } catch (err) {
      console.error(CONSOLE_MESSAGES.ERROR_LOADING_VERSIONS, err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVersions()
  }, [documentId])

  return { versions, loading, loadVersions }
}

