/**
 * useOptimisticUpdate Hook
 * 
 * Provides optimistic UI updates with automatic rollback on error.
 * Works seamlessly with React Query for instant perceived performance.
 * 
 * @example
 * ```tsx
 * const optimistic = useOptimisticUpdate({
 *   queryKey: ['documents', id],
 *   updateFn: (old, newData) => ({ ...old, ...newData }),
 * })
 * 
 * // Use in mutation
 * const mutation = useMutation({
 *   mutationFn: updateDocument,
 *   onMutate: (newData) => optimistic.update(newData),
 *   onError: (err, vars, context) => optimistic.rollback(context),
 *   onSettled: () => optimistic.invalidate(),
 * })
 * ```
 */

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export interface OptimisticUpdateConfig<TData, TVariables> {
    queryKey: unknown[]
    updateFn: (oldData: TData | undefined, variables: TVariables) => TData
    onError?: (error: Error) => void
}

export interface OptimisticUpdateReturn<TData, TVariables> {
    update: (variables: TVariables) => Promise<{ previousData: TData | undefined }>
    rollback: (context: { previousData: TData | undefined } | undefined) => void
    invalidate: () => Promise<void>
}

/**
 * Hook for optimistic updates with automatic rollback
 */
export function useOptimisticUpdate<TData = unknown, TVariables = unknown>(
    config: OptimisticUpdateConfig<TData, TVariables>
): OptimisticUpdateReturn<TData, TVariables> {
    const { queryKey, updateFn, onError } = config
    const queryClient = useQueryClient()

    /**
     * Perform optimistic update
     * Returns the previous data for potential rollback
     */
    const update = useCallback(
        async (variables: TVariables): Promise<{ previousData: TData | undefined }> => {
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey })

            // Snapshot the previous value
            const previousData = queryClient.getQueryData<TData>(queryKey)

            // Optimistically update to the new value
            queryClient.setQueryData<TData>(queryKey, (old) => updateFn(old, variables))

            // Return context with previous data for rollback
            return { previousData }
        },
        [queryClient, queryKey, updateFn]
    )

    /**
     * Rollback to previous data on error
     */
    const rollback = useCallback(
        (context: { previousData: TData | undefined } | undefined) => {
            if (context?.previousData !== undefined) {
                queryClient.setQueryData(queryKey, context.previousData)
            }
        },
        [queryClient, queryKey]
    )

    /**
     * Invalidate query to refetch from server
     */
    const invalidate = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey })
    }, [queryClient, queryKey])

    return {
        update,
        rollback,
        invalidate,
    }
}

/**
 * Utility: Create optimistic update for toggling a boolean field
 */
export function useOptimisticToggle<TData extends Record<string, unknown>>(
    queryKey: unknown[],
    field: keyof TData
) {
    return useOptimisticUpdate<TData, boolean>({
        queryKey,
        updateFn: (oldData, newValue) => {
            if (!oldData) return {} as TData
            return {
                ...oldData,
                [field]: newValue,
            }
        },
    })
}

/**
 * Utility: Create optimistic update for updating multiple fields
 */
export function useOptimisticPartialUpdate<TData extends Record<string, unknown>>(
    queryKey: unknown[]
) {
    return useOptimisticUpdate<TData, Partial<TData>>({
        queryKey,
        updateFn: (oldData, updates) => {
            if (!oldData) return updates as TData
            return {
                ...oldData,
                ...updates,
            }
        },
    })
}

/**
 * Utility: Create optimistic update for array operations
 */
export function useOptimisticArrayUpdate<TItem>(queryKey: unknown[]) {
    return {
        add: useOptimisticUpdate<TItem[], TItem>({
            queryKey,
            updateFn: (oldData, newItem) => {
                if (!oldData) return [newItem]
                return [...oldData, newItem]
            },
        }),
        remove: useOptimisticUpdate<TItem[], string | number>({
            queryKey,
            updateFn: (oldData, id) => {
                if (!oldData) return []
                return oldData.filter((item) => (item as { id: string | number }).id !== id)
            },
        }),
        update: useOptimisticUpdate<TItem[], { id: string | number; updates: Partial<TItem> }>({
            queryKey,
            updateFn: (oldData, { id, updates }) => {
                if (!oldData) return []
                return oldData.map((item) =>
                    (item as { id: string | number }).id === id ? { ...item, ...updates } : item
                )
            },
        }),
    }
}
