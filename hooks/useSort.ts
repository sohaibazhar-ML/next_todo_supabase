/**
 * useSort Hook
 * 
 * Reusable hook for managing sorting state and logic.
 * Supports ascending, descending, and no sort states.
 * Cycles through sort directions on toggle.
 * 
 * @example
 * const { sortedData, toggleSort, sortKey, sortDirection } = useSort({
 *   data: documents,
 *   initialSortKey: 'created_at',
 *   initialDirection: 'desc'
 * })
 */

import { useState, useMemo } from 'react'

export type SortDirection = 'asc' | 'desc' | null

export interface UseSortProps<T> {
    data: T[]
    initialSortKey?: keyof T
    initialDirection?: SortDirection
}

export interface UseSortReturn<T> {
    sortedData: T[]
    sortKey: keyof T | null
    sortDirection: SortDirection
    toggleSort: (key: keyof T) => void
    resetSort: () => void
}

export function useSort<T>({
    data,
    initialSortKey,
    initialDirection = null,
}: UseSortProps<T>): UseSortReturn<T> {
    const [sortKey, setSortKey] = useState<keyof T | null>(initialSortKey || null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection)

    const sortedData = useMemo(() => {
        if (!sortKey || !sortDirection) return data

        return [...data].sort((a, b) => {
            const aValue = a[sortKey]
            const bValue = b[sortKey]

            if (aValue === bValue) return 0

            const comparison = aValue < bValue ? -1 : 1
            return sortDirection === 'asc' ? comparison : -comparison
        })
    }, [data, sortKey, sortDirection])

    const toggleSort = (key: keyof T) => {
        if (sortKey === key) {
            // Cycle through: asc -> desc -> null
            setSortDirection(prev =>
                prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
            )
            if (sortDirection === 'desc') {
                setSortKey(null)
            }
        } else {
            setSortKey(key)
            setSortDirection('asc')
        }
    }

    const resetSort = () => {
        setSortKey(null)
        setSortDirection(null)
    }

    return {
        sortedData,
        sortKey,
        sortDirection,
        toggleSort,
        resetSort,
    }
}
