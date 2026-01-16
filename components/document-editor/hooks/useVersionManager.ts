/**
 * Hook for managing document versions
 * 
 * This hook provides functionality to load document versions from the API.
 * It can be used in two ways:
 * 1. With internal state management (default)
 * 2. With external state management (pass setVersions callback)
 * 
 * Usage:
 *   // With internal state
 *   const { versions, loading, loadVersions } = useVersionManager({ documentId })
 * 
 *   // With external state
 *   const { loadVersions } = useVersionManager({ documentId, setVersions })
 */

import { useState, useEffect } from 'react'
import { API_ENDPOINTS, CONSOLE_MESSAGES } from '@/constants'
import type { UserVersion } from '@/types/documentEditor'

interface UseVersionManagerProps {
  /**
   * Document ID to load versions for
   */
  documentId: string

  /**
   * Optional callback to set versions externally
   * If provided, hook won't manage versions state internally
   */
  setVersions?: (versions: UserVersion[]) => void
}

/**
 * Return type for useVersionManager hook
 */
interface UseVersionManagerReturn {
  /**
   * Array of document versions (only if using internal state)
   */
  versions?: UserVersion[]

  /**
   * Loading state (only if using internal state)
   */
  loading?: boolean

  /**
   * Function to load versions
   * Returns the loaded versions array
   */
  loadVersions: () => Promise<UserVersion[]>
}

/**
 * Hook for managing document versions
 * 
 * @param props - Hook configuration
 * @returns Versions data and load function
 */
export function useVersionManager({
  documentId,
  setVersions: externalSetVersions,
}: UseVersionManagerProps): UseVersionManagerReturn {
  // Internal state (only used if external setVersions not provided)
  const [versions, setVersionsInternal] = useState<UserVersion[]>([])
  const [loading, setLoading] = useState(false)

  // Use external or internal setVersions
  const setVersions = externalSetVersions || setVersionsInternal

  /**
   * Load versions from API
   * 
   * @returns Array of loaded versions
   */
  const loadVersions = async (): Promise<UserVersion[]> => {
    try {
      if (!externalSetVersions) {
        setLoading(true)
      }

      const response = await fetch(API_ENDPOINTS.DOCUMENT_EDIT(documentId))
      if (response.ok) {
        const data = await response.json()
        setVersions(data)
        return data
      }
      return []
    } catch (err) {
      console.error(CONSOLE_MESSAGES.ERROR_LOADING_VERSIONS, err)
      return []
    } finally {
      if (!externalSetVersions) {
        setLoading(false)
      }
    }
  }

  // Auto-load on mount if using internal state
  useEffect(() => {
    if (!externalSetVersions) {
      loadVersions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId])

  // Return appropriate values based on usage mode
  if (externalSetVersions) {
    return { loadVersions }
  }

  return { versions, loading, loadVersions }
}

