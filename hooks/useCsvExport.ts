/**
 * CSV Export Hook
 * 
 * Custom hook for exporting data to CSV format.
 */

import { useCallback } from 'react'

export interface CsvHeader<T> {
  key: keyof T
  label: string
}

export interface UseCsvExportOptions<T> {
  /**
   * Data to export
   */
  data: T[]
  
  /**
   * CSV headers configuration
   */
  headers: CsvHeader<T>[]
  
  /**
   * Filename for the exported CSV
   */
  filename: string
}

export interface UseCsvExportReturn {
  /**
   * Export data to CSV
   */
  exportToCsv: () => void
}

/**
 * Hook for CSV export functionality
 */
export function useCsvExport<T extends Record<string, unknown> | Record<keyof T, unknown>>({
  data,
  headers,
  filename,
}: UseCsvExportOptions<T>): UseCsvExportReturn {
  const exportToCsv = useCallback(() => {
    if (data.length === 0) {
      return
    }

    // Create header row
    const headerRow = headers.map((h) => h.label).join(',')

    // Create data rows
    const rows = data.map((item) =>
      headers
        .map((header) => {
          const raw = item[header.key]
          const value =
            raw === null || raw === undefined ? '' : String(raw).trim()
          // Escape quotes and wrap in quotes
          const escaped = value.replace(/"/g, '""')
          return `"${escaped}"`
        })
        .join(',')
    )

    // Combine header and rows
    const csvContent = [headerRow, ...rows].join('\r\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [data, headers, filename])

  return { exportToCsv }
}

