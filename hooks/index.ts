/**
 * Custom Hooks Index
 * 
 * Central export file for all custom hooks
 */

// Utility hooks
export { useDebounce } from './useDebounce'
export { useDocumentFilters } from './useDocumentFilters'
export { useUserFilters } from './useUserFilters'
export { useCsvExport } from './useCsvExport'
export { useDocumentDownload } from './useDocumentDownload'

// New reusable hooks
export { useModal } from './useModal'
export { usePagination } from './usePagination'
export { useSort } from './useSort'
export { useSubadminActions } from './useSubadminActions'

// Phase 1 Refactoring: New utility hooks
export { useTableState } from './useTableState'
export { useFileUpload } from './useFileUpload'
export {
    useOptimisticUpdate,
    useOptimisticToggle,
    useOptimisticPartialUpdate,
    useOptimisticArrayUpdate,
} from './useOptimisticUpdate'
export { useSocialAuth } from './useSocialAuth'
export { useTagInput } from './useTagInput'

// Re-export types
export type { UseModalReturn } from './useModal'
export type { UsePaginationProps, UsePaginationReturn } from './usePagination'
export type { SortDirection, UseSortProps, UseSortReturn } from './useSort'
export type { SubadminActionType } from './useSubadminActions'

// Phase 1 Refactoring: New utility hook types
export type { TableState, TableStateConfig, SortConfig, PaginationConfig } from './useTableState'
export type { FileUploadConfig, FileUploadState, FileWithPreview } from './useFileUpload'
export type { OptimisticUpdateConfig, OptimisticUpdateReturn } from './useOptimisticUpdate'
