/**
 * useTagInput Hook
 * 
 * Centralized hook for tag input management.
 * Eliminates code duplication between DocumentUploadFields and DocumentEditFields.
 * 
 * @example
 * ```tsx
 * const { tagInput, tags, handleAddTag, handleRemoveTag, handleTagKeyPress, setTagInput } =
 *   useTagInput({
 *     form,
 *     fieldName: 'tags',
 *   })
 * 
 * <input
 *   value={tagInput}
 *   onChange={(e) => setTagInput(e.target.value)}
 *   onKeyPress={handleTagKeyPress}
 * />
 * ```
 */

import { useState, useCallback } from 'react'
import type {
  FieldValues,
  Path,
  UseFormReturn,
} from 'react-hook-form'

export interface UseTagInputOptions<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
> {
  /**
   * React Hook Form instance
   */
  form: UseFormReturn<TFieldValues>

  /**
   * Name of the tags field in the form
   * @default 'tags'
   */
  fieldName?: TName
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
export function useTagInput<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
>(options: UseTagInputOptions<TFieldValues, TName>): UseTagInputReturn {
  const { form, fieldName } = options
  const { watch, setValue } = form

  const [tagInput, setTagInput] = useState('')

  const watchedFieldName = (fieldName ?? ('tags' as TName)) as TName

  // Watch tags to get current value
  const tags: string[] = (watch(watchedFieldName) as string[] | undefined) || []

  const handleAddTag = useCallback(() => {
    const trimmedTag = tagInput.trim()

    if (trimmedTag && !tags.includes(trimmedTag)) {
      setValue(watchedFieldName, [...tags, trimmedTag] as unknown as TFieldValues[TName], {
        shouldValidate: true,
      })
      setTagInput('')
    }
  }, [tagInput, tags, setValue, watchedFieldName])

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const nextTags = tags.filter((tag) => tag !== tagToRemove)
      setValue(watchedFieldName, nextTags as unknown as TFieldValues[TName], {
        shouldValidate: true,
      })
    },
    [tags, setValue, watchedFieldName],
  )

  const handleTagKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddTag()
      }
    },
    [handleAddTag],
  )

  return {
    tagInput,
    setTagInput,
    tags,
    handleAddTag,
    handleRemoveTag,
    handleTagKeyPress,
  }
}
