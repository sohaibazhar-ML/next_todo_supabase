'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/types/document'

interface DocumentCardProps {
  document: Document
}

export default function DocumentCard({ document }: DocumentCardProps) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'PDF':
        return (
          <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
          </svg>
        )
      case 'DOCX':
        return (
          <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
          </svg>
        )
      case 'XLSX':
        return (
          <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
          </svg>
        )
      case 'ZIP':
        return (
          <svg className="h-8 w-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
          </svg>
        )
      default:
        return (
          <svg className="h-8 w-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
          </svg>
        )
    }
  }

  const handleDownload = async () => {
    try {
      setDownloading(true)
      setError(null)

      // Get user info for logging
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to download documents')
      }

      console.log('Starting download for file:', document.file_path)

      // Get download URL from API
      const urlResponse = await fetch(`/api/documents/${document.id}/download-url`)
      const urlData = await urlResponse.json()

      if (!urlResponse.ok || !urlData.signedUrl) {
        throw new Error(urlData.error || 'Failed to generate download URL')
      }

      // Log the download BEFORE triggering download (important for count increment)
      let downloadLogged = false
      try {
        const logResponse = await fetch('/api/download-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: document.id,
            user_id: user.id,
            context: 'download_center',
            metadata: {
              file_name: document.file_name,
              file_type: document.file_type,
            },
          })
        })

        if (!logResponse.ok) {
          console.error('Error logging download:', await logResponse.json())
        } else {
          downloadLogged = true
          console.log('Download logged successfully')
        }
      } catch (logErr: any) {
        console.error('Error logging download:', logErr)
      }

      // Trigger download using blob method to force download (especially for PDFs)
      try {
        // Fetch the file as a blob to force download behavior
        const fileResponse = await fetch(urlData.signedUrl)
        if (!fileResponse.ok) {
          throw new Error('Failed to fetch file')
        }
        
        const blob = await fileResponse.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        
        // Create download link with blob URL
        const link = window.document.createElement('a')
        link.href = blobUrl
        link.download = document.file_name
        link.style.display = 'none'
        window.document.body.appendChild(link)
        link.click()
        
        // Clean up: remove link and revoke blob URL
        setTimeout(() => {
          if (window.document.body.contains(link)) {
            window.document.body.removeChild(link)
          }
          window.URL.revokeObjectURL(blobUrl)
        }, 100)

        // Show success - download should start
        setError(null)
        
        // Wait a bit for the trigger to process, then refresh to update download count
        // Only refresh if download was logged successfully
        if (downloadLogged) {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } catch (downloadErr: any) {
        console.error('Error triggering download:', downloadErr)
        // Fallback: open in new window if download link method fails
        const fallbackWindow = window.open(urlData.signedUrl, '_blank')
        if (!fallbackWindow) {
          throw new Error('Download failed and popup was blocked. Please allow popups for this site.')
        }
        throw new Error(`Download link failed. File opened in new tab instead.`)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to download document'
      setError(errorMessage)
      console.error('Download error:', err)
      
      // If we have a signed URL but download failed, offer to open in new tab
      if (err.message && !err.message.includes('generate download URL')) {
        // Try to get URL again as fallback
        try {
          const fallbackResponse = await fetch(`/api/documents/${document.id}/download-url`)
          const fallbackData = await fallbackResponse.json()
          
          if (fallbackData?.signedUrl) {
            const openNewTab = confirm(
              'Automatic download failed. Would you like to open the file in a new tab instead?'
            )
            if (openNewTab) {
              window.open(fallbackData.signedUrl, '_blank')
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback download also failed:', fallbackErr)
        }
      }
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {getFileIcon(document.file_type)}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {document.title}
              </h3>
              {document.is_featured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {document.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {document.description}
          </p>
        )}

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {document.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                +{document.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 mb-4 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span>Category:</span>
            <span className="font-medium text-gray-900">{document.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>File Type:</span>
            <span className="font-medium text-gray-900">{document.file_type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Size:</span>
            <span className="font-medium text-gray-900">{formatFileSize(document.file_size)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Downloads:</span>
            <span className="font-medium text-gray-900">{document.download_count}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {downloading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </>
          )}
        </button>
      </div>
    </div>
  )
}

