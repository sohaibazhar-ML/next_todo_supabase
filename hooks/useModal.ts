/**
 * useModal Hook
 * 
 * Reusable hook for managing modal state.
 * Provides open, close, toggle functionality and data management.
 * 
 * @example
 * const editModal = useModal<Document>()
 * editModal.open(document)
 * editModal.close()
 * editModal.data // Current document
 */

import { useState, useCallback } from 'react'

export interface UseModalReturn<T> {
    isOpen: boolean
    data: T | null
    open: (modalData?: T) => void
    close: () => void
    toggle: () => void
    setData: (data: T | null) => void
}

export function useModal<T = unknown>(initialState: T | null = null): UseModalReturn<T> {
    const [isOpen, setIsOpen] = useState(false)
    const [data, setData] = useState<T | null>(initialState)

    const open = useCallback((modalData?: T) => {
        if (modalData !== undefined) {
            setData(modalData)
        }
        setIsOpen(true)
    }, [])

    const close = useCallback(() => {
        setIsOpen(false)
        setData(null)
    }, [])

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev)
    }, [])

    return {
        isOpen,
        data,
        open,
        close,
        toggle,
        setData,
    }
}
