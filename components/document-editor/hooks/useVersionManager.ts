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

import { useUserDocumentVersions } from '@/hooks/api/useDocuments'
import type { UserVersion } from '@/types/documentEditor'

interface UseVersionManagerProps {
  /**
   * Document ID to load versions for
   */
  documentId: string
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
}: UseVersionManagerProps): UseVersionManagerReturn {
  const { data: versionsData = [], isLoading, refetch } = useUserDocumentVersions(documentId)

  // Cast to UserVersion[] since we know the shape matches but types are strictly incompatible due to unknown vs specific type
  const versions = versionsData as unknown as UserVersion[]

  return {
    versions,
    loading: isLoading,
    loadVersions: async () => {
      const result = await refetch()
      return (result.data as unknown as UserVersion[]) || []
    }
  }
}
