/**
 * Utility functions for file operations and formatting
 */

import { DEFAULT_VALUES } from '@/constants'

/**
 * Format file size in bytes to human-readable string
 * Uses constants from @/constants for consistency
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0 || isNaN(bytes)) {
    return `${DEFAULT_VALUES.FILE_SIZE_ZERO} ${DEFAULT_VALUES.FILE_SIZE_UNITS[0]}`
  }
  const k = DEFAULT_VALUES.FILE_SIZE_BASE
  const sizes = DEFAULT_VALUES.FILE_SIZE_UNITS
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (
    Math.round((bytes / Math.pow(k, i)) * DEFAULT_VALUES.FILE_SIZE_ROUNDING) /
      DEFAULT_VALUES.FILE_SIZE_ROUNDING +
    ' ' +
    sizes[i]
  )
}

/**
 * Get file type from filename
 * @param fileName - Name of the file
 * @returns File type string ('pdf', 'document', 'spreadsheet', 'archive', 'other')
 */
export function getFileType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext || '')) return 'document'
  if (['xls', 'xlsx'].includes(ext || '')) return 'spreadsheet'
  if (ext === 'zip') return 'archive'
  return 'other'
}

/**
 * Get file icon color class based on file type
 * @param fileType - File type string (PDF, DOCX, XLSX, ZIP)
 * @returns Color class string for the file icon
 */
export function getFileIconColor(fileType: string): string {
  const colors: Record<string, string> = {
    'PDF': 'text-red-600',
    'DOCX': 'text-blue-600',
    'XLSX': 'text-green-600',
    'ZIP': 'text-yellow-600',
  }
  return colors[fileType] || 'text-gray-600'
}

