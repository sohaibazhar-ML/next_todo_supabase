/**
 * Subadmin Actions Hook
 * 
 * Custom hook to manage loading states for individual subadmin actions.
 * Tracks which specific action (edit, delete, toggle) is loading for each subadmin.
 */

import { useState } from 'react'

export type SubadminActionType = 'edit' | 'delete' | 'toggle'

interface LoadingState {
    [subadminId: string]: {
        [action in SubadminActionType]?: boolean
    }
}

export function useSubadminActions() {
    const [loadingStates, setLoadingStates] = useState<LoadingState>({})

    /**
     * Check if a specific action is loading for a subadmin
     */
    const isActionLoading = (subadminId: string, action: SubadminActionType): boolean => {
        return loadingStates[subadminId]?.[action] ?? false
    }

    /**
     * Set loading state for a specific action
     */
    const setActionLoading = (
        subadminId: string,
        action: SubadminActionType,
        loading: boolean
    ) => {
        setLoadingStates((prev) => ({
            ...prev,
            [subadminId]: {
                ...prev[subadminId],
                [action]: loading,
            },
        }))
    }

    /**
     * Execute an action with automatic loading state management
     */
    const executeAction = async <T,>(
        subadminId: string,
        action: SubadminActionType,
        fn: () => Promise<T>
    ): Promise<T> => {
        setActionLoading(subadminId, action, true)
        try {
            return await fn()
        } finally {
            setActionLoading(subadminId, action, false)
        }
    }

    return {
        isActionLoading,
        setActionLoading,
        executeAction,
    }
}
