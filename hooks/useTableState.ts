/**
 * useTableState Hook
 * 
 * Centralized state management for table components with pagination, sorting, and filtering.
 * Eliminates duplicate code across DocumentTable, UserList, and SubadminListTable.
 * 
 * @example
 * ```tsx
 * const table = useTableState({
 *   initialPageSize: 10,
 *   initialSort: { field: 'created_at', order: 'desc' }
 * })
 * 
 * // Use in component
 * <Table
 *   page={table.page}
 *   onPageChange={table.setPage}
 *   sortBy={table.sortBy}
 *   onSort={table.handleSort}
 * />
 * ```
 */

import { useState, useCallback, useMemo } from 'react'

export interface SortConfig<T = string> {
    field: T
    order: 'asc' | 'desc'
}

export interface PaginationConfig {
    page: number
    pageSize: number
    total: number
}

export interface TableStateConfig<TSort = string> {
    initialPage?: number
    initialPageSize?: number
    initialSort?: SortConfig<TSort>
    initialFilters?: Record<string, unknown>
}

export interface TableState<TSort = string> {
    // Pagination
    page: number
    pageSize: number
    total: number
    totalPages: number
    setPage: (page: number) => void
    setPageSize: (size: number) => void
    setTotal: (total: number) => void
    nextPage: () => void
    prevPage: () => void
    canNextPage: boolean
    canPrevPage: boolean

    // Sorting
    sortBy: SortConfig<TSort> | null
    setSortBy: (sort: SortConfig<TSort> | null) => void
    handleSort: (field: TSort) => void
    toggleSortOrder: () => void

    // Filtering
    filters: Record<string, unknown>
    setFilters: (filters: Record<string, unknown>) => void
    setFilter: (key: string, value: unknown) => void
    clearFilter: (key: string) => void
    clearAllFilters: () => void
    hasActiveFilters: boolean

    // Reset
    reset: () => void
}

/**
 * Hook for managing table state (pagination, sorting, filtering)
 */
export function useTableState<TSort = string>(
    config: TableStateConfig<TSort> = {}
): TableState<TSort> {
    const {
        initialPage = 1,
        initialPageSize = 10,
        initialSort = null,
        initialFilters = {},
    } = config

    // Pagination state
    const [page, setPage] = useState(initialPage)
    const [pageSize, setPageSize] = useState(initialPageSize)
    const [total, setTotal] = useState(0)

    // Sorting state
    const [sortBy, setSortBy] = useState<SortConfig<TSort> | null>(initialSort)

    // Filtering state
    const [filters, setFilters] = useState<Record<string, unknown>>(initialFilters)

    // Computed values
    const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize])
    const canNextPage = page < totalPages
    const canPrevPage = page > 1
    const hasActiveFilters = useMemo(
        () => Object.keys(filters).length > 0,
        [filters]
    )

    // Pagination handlers
    const nextPage = useCallback(() => {
        if (canNextPage) {
            setPage((p) => p + 1)
        }
    }, [canNextPage])

    const prevPage = useCallback(() => {
        if (canPrevPage) {
            setPage((p) => p - 1)
        }
    }, [canPrevPage])

    const handleSetPageSize = useCallback((size: number) => {
        setPageSize(size)
        setPage(1) // Reset to first page when changing page size
    }, [])

    // Sorting handlers
    const handleSort = useCallback(
        (field: TSort) => {
            setSortBy((current) => {
                if (!current || current.field !== field) {
                    return { field, order: 'asc' }
                }
                if (current.order === 'asc') {
                    return { field, order: 'desc' }
                }
                return null // Clear sort
            })
            setPage(1) // Reset to first page when sorting changes
        },
        []
    )

    const toggleSortOrder = useCallback(() => {
        setSortBy((current) => {
            if (!current) return null
            return {
                ...current,
                order: current.order === 'asc' ? 'desc' : 'asc',
            }
        })
    }, [])

    // Filtering handlers
    const setFilter = useCallback((key: string, value: unknown) => {
        setFilters((current) => ({
            ...current,
            [key]: value,
        }))
        setPage(1) // Reset to first page when filters change
    }, [])

    const clearFilter = useCallback((key: string) => {
        setFilters((current) => {
            const newFilters = { ...current }
            delete newFilters[key]
            return newFilters
        })
        setPage(1)
    }, [])

    const clearAllFilters = useCallback(() => {
        setFilters({})
        setPage(1)
    }, [])

    // Reset all state
    const reset = useCallback(() => {
        setPage(initialPage)
        setPageSize(initialPageSize)
        setTotal(0)
        setSortBy(initialSort)
        setFilters(initialFilters)
    }, [initialPage, initialPageSize, initialSort, initialFilters])

    return {
        // Pagination
        page,
        pageSize,
        total,
        totalPages,
        setPage,
        setPageSize: handleSetPageSize,
        setTotal,
        nextPage,
        prevPage,
        canNextPage,
        canPrevPage,

        // Sorting
        sortBy,
        setSortBy,
        handleSort,
        toggleSortOrder,

        // Filtering
        filters,
        setFilters,
        setFilter,
        clearFilter,
        clearAllFilters,
        hasActiveFilters,

        // Reset
        reset,
    }
}
