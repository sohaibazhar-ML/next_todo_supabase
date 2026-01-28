/**
 * usePagination Hook
 * 
 * Reusable hook for managing pagination state and logic.
 * Provides page navigation, bounds checking, and index calculation.
 * 
 * @example
 * const pagination = usePagination({ totalItems: 100, itemsPerPage: 10 })
 * const items = data.slice(pagination.startIndex, pagination.endIndex)
 */

import { useState, useMemo } from 'react'
import { DEFAULT_VALUES } from '@/constants/defaults'

export interface UsePaginationProps {
    totalItems: number
    itemsPerPage?: number
    initialPage?: number
}

export interface UsePaginationReturn {
    currentPage: number
    totalPages: number
    startIndex: number
    endIndex: number
    goToPage: (page: number) => void
    nextPage: () => void
    previousPage: () => void
    goToFirstPage: () => void
    goToLastPage: () => void
    hasNextPage: boolean
    hasPreviousPage: boolean
}

export function usePagination({
    totalItems,
    itemsPerPage = DEFAULT_VALUES.PAGINATION.ITEMS_PER_PAGE,
    initialPage = DEFAULT_VALUES.PAGINATION.INITIAL_PAGE,
}: UsePaginationProps): UsePaginationReturn {
    const [currentPage, setCurrentPage] = useState(initialPage)

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return { startIndex, endIndex }
    }, [currentPage, itemsPerPage])

    const goToPage = (page: number) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages))
        setCurrentPage(pageNumber)
    }

    const nextPage = () => goToPage(currentPage + 1)
    const previousPage = () => goToPage(currentPage - 1)
    const goToFirstPage = () => goToPage(1)
    const goToLastPage = () => goToPage(totalPages)

    return {
        currentPage,
        totalPages,
        startIndex: paginatedData.startIndex,
        endIndex: paginatedData.endIndex,
        goToPage,
        nextPage,
        previousPage,
        goToFirstPage,
        goToLastPage,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
    }
}
