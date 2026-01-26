/**
 * Statistics Types
 * 
 * Type definitions for statistics and filtering
 */

/**
 * Filter state for statistics
 */
export interface StatsFiltersState {
    fromDate: string
    toDate: string
    search: string
    category: string
    selectedTags: string[]
}

/**
 * Statistics filter options (available values)
 */
export interface StatsFilterOptions {
    categories: string[]
    tags: string[]
}

/**
 * Statistics data structure
 */
export interface Statistics {
    totalDocuments: number
    totalDownloads: number
    totalUsers: number
    activeUsers: number
    documentsThisMonth: number
    downloadsThisMonth: number
    topDocuments: Array<{
        id: string
        title: string
        downloads: number
    }>
    downloadsByCategory: Record<string, number>
    downloadsByDate: Array<{
        date: string
        count: number
    }>
    filterOptions: StatsFilterOptions
}

/**
 * Download log entry
 */
export interface DownloadLog {
    id: string
    document_id: string
    user_id: string | null
    downloaded_at: string
    document?: {
        title: string
        category: string
    }
    user?: {
        email: string
        first_name: string
        last_name: string
    }
}
