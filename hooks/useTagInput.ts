/**
 * useTagInput Hook
 * 
 * Centralized hook for tag input management.
 * Eliminates code duplication between DocumentUploadFields and DocumentEditFields.
 * 
 * @example
 * ```tsx
 * const { tagInput, tags, handleAddTag, handleRemoveTag, handleTagKeyPress, setTagInput } = useTagInput({
 *   form,
 *   fieldName: 'tags'
 * })
 * 
 * <input
 *   value={tagInput}
 *   onChange={(e) => setTagInput(e.target.value)}
 *   onKeyPress={handleTagKeyPress}
 * />
 * ```
 */

import { useState, useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'

export interface UseTagInputOptions {
    /**
     * React Hook Form instance
     */
    form: UseFormReturn<any>

    /**
     * Name of the tags field in the form
     * @default 'tags'
     */
    fieldName?: string
}

export interface UseTagInputReturn {
    /**
     * Current tag input value
     */
    tagInput: string

    /**
     * Set tag input value
     */
    setTagInput: (value: string) => void

    /**
     * Current tags array
     */
    tags: string[]

    /**
     * Add a tag to the list
     */
    handleAddTag: () => void

    /**
     * Remove a tag from the list
     */
    handleRemoveTag: (tagToRemove: string) => void

    /**
     * Handle keyboard events (Enter to add tag)
     */
    handleTagKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

/**
 * Hook for managing tag input functionality
 */
export function useTagInput(options: UseTagInputOptions): UseTagInputReturn {
    const { form, fieldName = 'tags' } = options
    const { watch, setValue } = form

    const [tagInput, setTagInput] = useState('')

    // Watch tags to get current value
    const tags: string[] = watch(fieldName) || []

    const handleAddTag = useCallback(() => {
        const trimmedTag = tagInput.trim()

        if (trimmedTag && !tags.includes(trimmedTag)) {
            setValue(fieldName, [...tags, trimmedTag], { shouldValidate: true })
            setTagInput('')
        }
    }, [tagInput, tags, setValue, fieldName])

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        setValue(
            fieldName,
            tags.filter((tag) => tag !== tagToRemove),
            { shouldValidate: true }
        )
    }, [tags, setValue, fieldName])

    const handleTagKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTag()
        }
    }, [handleAddTag])

    return {
        tagInput,
        setTagInput,
        tags,
        handleAddTag,
        handleRemoveTag,
        handleTagKeyPress,
    }
}
