/**
 * Document Download Hook
 * 
 * Custom hook for handling document download functionality.
 * Handles download URL generation, logging, and file download.
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/types/document'
import { API_ENDPOINTS, CONTENT_TYPES, ERROR_MESSAGES, CONSOLE_MESSAGES, DEFAULT_VALUES } from '@/constants'
import { isErrorWithMessage } from '@/types'

export interface UseDocumentDownloadOptions {
  /**
   * Callback when download succeeds
   */
  onSuccess?: () => void
}

export interface UseDocumentDownloadReturn {
  /**
   * Whether download is in progress
   */
  downloading: boolean

  /**
   * Error message if download fails
   */
  error: string | null

  /**
   * Download a document
   */
  downloadDocument: (document: Document, baseDocument?: Document) => Promise<void>
}

/**
 * Hook for downloading documents
 */
export function useDocumentDownload({
  onSuccess,
}: UseDocumentDownloadOptions = {}): UseDocumentDownloadReturn {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const downloadDocument = async (document: Document, baseDocument?: Document) => {
    if (!document || typeof document !== 'object' || !('id' in document)) {
      setError(ERROR_MESSAGES.NO_DOCUMENT_SELECTED)
      return
    }

    if (!document.id || typeof document.id !== 'string') {
      setError(ERROR_MESSAGES.INVALID_DOCUMENT_SELECTED)
      return
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(document.id)) {
      setError(ERROR_MESSAGES.INVALID_DOCUMENT_ID)
      return
    }

    try {
      setDownloading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error(ERROR_MESSAGES.MUST_BE_LOGGED_IN)
      }

      // Get signed download URL
      const urlResponse = await fetch(
        API_ENDPOINTS.DOCUMENT_DOWNLOAD_URL(document.id)
      )
      const urlData = await urlResponse.json()

      if (!urlResponse.ok || !urlData.signedUrl) {
        throw new Error(
          (typeof urlData === 'object' && urlData !== null && 'error' in urlData && typeof urlData.error === 'string')
            ? urlData.error
            : ERROR_MESSAGES.GENERATE_DOWNLOAD_URL_FAILED
        )
      }

      // Log download
      let downloadLogged = false
      try {
        const logResponse = await fetch(API_ENDPOINTS.DOWNLOAD_LOGS, {
          method: 'POST',
          headers: { 'Content-Type': CONTENT_TYPES.JSON },
          body: JSON.stringify({
            document_id: document.id,
            user_id: user.id,
            context: DEFAULT_VALUES.DOWNLOAD_CONTEXT,
            metadata: {
              file_name: document.file_name,
              file_type: document.file_type,
              version: document.version || DEFAULT_VALUES.DEFAULT_VERSION,
            },
          }),
        })
        downloadLogged = logResponse.ok
      } catch (logErr) {
        console.error(CONSOLE_MESSAGES.ERROR_LOGGING_DOWNLOAD, logErr)
      }

      // Download file
      try {
        const fileResponse = await fetch(urlData.signedUrl)
        if (!fileResponse.ok) {
          throw new Error(ERROR_MESSAGES.FAILED_TO_FETCH_FILE)
        }

        const blob = await fileResponse.blob()
        const blobUrl = window.URL.createObjectURL(blob)

        const link = window.document.createElement('a')
        link.href = blobUrl

        // Generate filename with version if different from base
        const fileName = document.version && baseDocument && document.version !== baseDocument.version
          ? `${document.file_name.replace(/\.[^/.]+$/, '')}_v${document.version}${document.file_name.match(/\.[^/.]+$/)?.[0] || ''}`
          : document.file_name

        link.download = fileName
        link.style.display = 'none'
        window.document.body.appendChild(link)
        link.click()

        // Cleanup
        setTimeout(() => {
          if (window.document.body.contains(link)) {
            window.document.body.removeChild(link)
          }
          window.URL.revokeObjectURL(blobUrl)
        }, DEFAULT_VALUES.CLEANUP_DELAY)

        // Reload page if download was logged
        if (downloadLogged) {
          setTimeout(() => {
            window.location.reload()
          }, DEFAULT_VALUES.RELOAD_DELAY)
        }

        onSuccess?.()
      } catch (downloadErr) {
        // Fallback: open in new window
        const fallbackWindow = window.open(urlData.signedUrl, '_blank')
        if (!fallbackWindow) {
          throw new Error(ERROR_MESSAGES.DOWNLOAD_POPUP_BLOCKED)
        }
      }
    } catch (err) {
      const errorMessage = isErrorWithMessage(err)
        ? err.message
        : ERROR_MESSAGES.DOWNLOAD_DOCUMENT
      setError(errorMessage)
    } finally {
      setDownloading(false)
    }
  }

  return {
    downloading,
    error,
    downloadDocument,
  }
}

