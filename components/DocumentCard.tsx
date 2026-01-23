/**
 * Document Card Component
 * 
 * Displays a document card with metadata, version management, and download functionality.
 * 
 * Features:
 * - Document metadata display
 * - Version selection and management
 * - Download functionality with logging
 * - Edit button for editable document types
 * 
 * This component has been refactored to:
 * - Use constants from @/constants
 * - Remove all 'any' types
 * - Use proper TypeScript types
 * - Extract utility functions
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import type { Document } from '@/types/document'
import { API_ENDPOINTS, CONTENT_TYPES, ERROR_MESSAGES, CONSOLE_MESSAGES, DEFAULT_VALUES } from '@/constants'
import { isErrorWithMessage } from '@/types'
import { formatFileSize, getFileIconColor } from '@/lib/utils/file-utils'
import { useDocumentVersions } from '@/hooks/api/useDocuments'
import { useDownloadLogs } from '@/hooks/api/useDownloadLogs'

interface DocumentCardProps {
  document: Document
}

export default function DocumentCard({ document }: DocumentCardProps) {
  const t = useTranslations('documentCard')
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVersions, setShowVersions] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Document | null>(document)
  const supabase = createClient()

  // Use React Query hooks for data fetching
  const { data: versions = [], isLoading: loadingVersions } = useDocumentVersions(
    showVersions ? document.id : null
  )
  const { data: downloadLogs = [] } = useDownloadLogs({ documentId: document.id })
  
  const versionCount = versions.length
  const actualDownloadCount = downloadLogs.length

  // Update selected version when versions are loaded
  useEffect(() => {
    if (versions.length > 0 && showVersions) {
      const currentVersion = versions.find((v: Document) => v.id === document.id) || document
      setSelectedVersion(currentVersion)
    }
  }, [versions, showVersions, document])

  // Check if document can be edited (PDF or DOCX/DOC files)
  // Database stores: 'pdf' for PDFs, 'document' for DOCX/DOC files
  // TypeScript type uses: 'PDF' for PDFs, 'DOCX' for DOCX/DOC files
  const fileTypeLower = document.file_type?.toLowerCase() || ''
  const canEdit = fileTypeLower === 'pdf' || fileTypeLower === 'document' || 
                  document.file_type === 'PDF' || document.file_type === 'DOCX'

  const handleEdit = () => {
    const locale = window.location.pathname.split('/')[1]
    router.push(`/${locale}/documents/${document.id}/edit`)
  }

  const getFileIcon = (fileType: string) => {
    const colorClass = getFileIconColor(fileType)
    return (
      <svg className={`h-8 w-8 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
      </svg>
    )
  }


  /**
   * Toggle versions display
   */
  const toggleVersions = () => {
    if (showVersions) {
      setShowVersions(false)
    } else {
      setShowVersions(true)
      // Versions will be fetched automatically by useDocumentVersions hook
    }
  }

  const handleDownload = async (downloadDocument?: Document) => {
    const docToDownload = downloadDocument || selectedVersion || document
    
    if (!docToDownload || typeof docToDownload !== 'object' || !('id' in docToDownload)) {
      setError('No document selected. Please select a version and try again.')
      return
    }

    if (!docToDownload.id || typeof docToDownload.id !== 'string') {
      setError('Invalid document selected. Please try again.')
      return
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(docToDownload.id)) {
      setError('Invalid document ID. Please refresh and try again.')
      return
    }
    
    try {
      setDownloading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in to download documents')

      const urlResponse = await fetch(
        API_ENDPOINTS.DOCUMENT_DOWNLOAD_URL(docToDownload.id)
      )
      const urlData = await urlResponse.json()

      if (!urlResponse.ok || !urlData.signedUrl) {
        throw new Error(
          (typeof urlData === 'object' && urlData !== null && 'error' in urlData && typeof urlData.error === 'string')
            ? urlData.error
            : ERROR_MESSAGES.GENERATE_DOWNLOAD_URL_FAILED
        )
      }

      let downloadLogged = false
      try {
        const logResponse = await fetch(API_ENDPOINTS.DOWNLOAD_LOGS, {
          method: 'POST',
          headers: { 'Content-Type': CONTENT_TYPES.JSON },
          body: JSON.stringify({
            document_id: docToDownload.id,
            user_id: user.id,
            context: DEFAULT_VALUES.DOWNLOAD_CONTEXT,
            metadata: {
              file_name: docToDownload.file_name,
              file_type: docToDownload.file_type,
              version: docToDownload.version || DEFAULT_VALUES.DEFAULT_VERSION,
            },
          }),
        })
        downloadLogged = logResponse.ok
      } catch (logErr) {
        console.error(CONSOLE_MESSAGES.ERROR_LOGGING_DOWNLOAD, logErr)
      }

      try {
        const fileResponse = await fetch(urlData.signedUrl)
        if (!fileResponse.ok) throw new Error('Failed to fetch file')
        
        const blob = await fileResponse.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        
        const link = window.document.createElement('a')
        link.href = blobUrl
        const fileName = docToDownload.version && docToDownload.version !== document.version
          ? `${docToDownload.file_name.replace(/\.[^/.]+$/, '')}_v${docToDownload.version}${docToDownload.file_name.match(/\.[^/.]+$/)?.[0] || ''}`
          : docToDownload.file_name
        link.download = fileName
        link.style.display = 'none'
        window.document.body.appendChild(link)
        link.click()
        
        setTimeout(() => {
          if (window.document.body.contains(link)) window.document.body.removeChild(link)
          window.URL.revokeObjectURL(blobUrl)
        }, 100)

        if (downloadLogged) {
          setTimeout(() => window.location.reload(), 1500)
        }
      } catch (downloadErr) {
        const fallbackWindow = window.open(urlData.signedUrl, '_blank')
        if (!fallbackWindow) throw new Error('Download failed and popup was blocked.')
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

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {getFileIcon(document.file_type)}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{document.title}</h3>
              {document.is_featured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                  {t('featured')}
                </span>
              )}
            </div>
          </div>
        </div>

        {document.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{document.description}</p>
        )}

        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {document.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                {tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                {t('more', { count: document.tags.length - 3 })}
              </span>
            )}
          </div>
        )}

        <div className="space-y-2 mb-4 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span>{t('category')}:</span>
            <span className="font-medium text-gray-900">{document.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('fileType')}:</span>
            <span className="font-medium text-gray-900">{document.file_type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('version')}:</span>
            <span className="font-medium text-gray-900">
              {document.version || DEFAULT_VALUES.DEFAULT_VERSION}
            </span>
          </div>
          {versionCount !== null && versionCount > 1 && (
            <div className="flex items-center justify-between">
              <span>{t('availableVersions')}:</span>
              <span className="font-medium text-indigo-600">{versionCount} {t('versions')}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>{t('size')}:</span>
            <span className="font-medium text-gray-900">{formatFileSize(document.file_size)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('downloadsThisVersion')}:</span>
            <span className="font-medium text-gray-900">
              {actualDownloadCount !== null ? actualDownloadCount : (document.download_count || 0)}
            </span>
          </div>
          {showVersions && versions.length > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span>{t('totalDownloads')}:</span>
              <span className="font-medium text-indigo-600">
                {versions.reduce((sum, v) => sum + (v.download_count || 0), 0)}
              </span>
            </div>
          )}
        </div>

        {showVersions && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {versions.length > 1 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">{t('selectVersion')}</label>
                  <span className="text-xs text-gray-500">
                    {t('versionsAvailable', { count: versions.length })}
                  </span>
                </div>
                <select
                  value={selectedVersion?.id || document.id}
                  onChange={(e) => {
                    const version = versions.find(v => v.id === e.target.value)
                    setSelectedVersion(version ? { ...version, id: String(version.id) } as Document : document)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 bg-white mb-3"
                >
                  {versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {t('version')} {version.version || DEFAULT_VALUES.DEFAULT_VERSION} -{' '}
                      {new Date(version.created_at).toLocaleDateString()} (
                      {formatFileSize(version.file_size)})
                      {version.id === document.id ? ` (${t('current')})` : ''}
                    </option>
                  ))}
                </select>
                
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-700 mb-2">{t('versionDetails')}</p>
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className={`p-2 rounded border text-xs ${
                        version.id === document.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">
                          {t('version')} {version.version || DEFAULT_VALUES.DEFAULT_VERSION}
                          {version.id === document.id && (
                            <span className="ml-1 text-indigo-600">({t('current')})</span>
                          )}
                        </span>
                        <span className="text-gray-600">{version.download_count || 0} {t('downloads')}</span>
                      </div>
                      <div className="text-gray-500">
                        {new Date(version.created_at).toLocaleDateString()} • {formatFileSize(version.file_size)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600 text-center">{t('noOtherVersions')}</p>
            )}
          </div>
        )}

        <div className="mb-4">
          <button
            onClick={toggleVersions}
            disabled={loadingVersions}
            className="w-full px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingVersions ? t('loadingVersions') : showVersions ? t('hideVersions') : t('viewAllVersions')}
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {canEdit && (
          <button
            onClick={(e) => { e.preventDefault(); handleEdit(); }}
            className="w-full mb-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t('edit')}
          </button>
        )}

        <button
          onClick={(e) => { e.preventDefault(); handleDownload(); }}
          disabled={downloading}
          className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {downloading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('downloading')}
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('download')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
