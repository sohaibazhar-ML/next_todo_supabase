/**
 * Document Edit Form Fields
 * 
 * Reusable form fields component for document edit form.
 * Uses react-hook-form for form state management.
 */

import React from 'react'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import type { DocumentEditFormData } from './documentEditSchema'
import { Input, Textarea, Select, Checkbox, Button } from '@/components/ui'
import { useDocumentFilterOptions } from '@/hooks/api/useDocuments'

export interface DocumentEditFieldsProps {
  /**
   * React Hook Form instance
   */
  form: UseFormReturn<DocumentEditFormData>
  
  /**
   * Whether form is in loading state
   */
  isLoading?: boolean
  
  /**
   * Document version (for display)
   */
  version?: string | null
  
  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void
}

export default function DocumentEditFields({
  form,
  isLoading = false,
  version,
  onCancel,
}: DocumentEditFieldsProps) {
  const t = useTranslations('documentEditModal')
  const { data: filterOptions } = useDocumentFilterOptions()
  
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form

  // Watch tags to display them
  const tags = watch('tags') || []
  const [tagInput, setTagInput] = React.useState('')

  // Get categories for select dropdown
  const categoryOptions = filterOptions?.categories.map((cat) => ({
    value: cat,
    label: cat,
  })) || []

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()], { shouldValidate: true })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter((tag) => tag !== tagToRemove),
      { shouldValidate: true }
    )
  }

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="space-y-4">
      {/* Info message about version syncing */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> {t('editNote')}
        </p>
      </div>

      {/* Title */}
      <Input
        {...register('title')}
        label={t('title')}
        placeholder={t('titlePlaceholder')}
        error={errors.title?.message}
        required
        disabled={isLoading}
      />

      {/* Description */}
      <Textarea
        {...register('description')}
        label={t('description')}
        placeholder={t('descriptionPlaceholder')}
        error={errors.description?.message}
        rows={3}
        disabled={isLoading}
      />

      {/* Category */}
      {categoryOptions.length > 0 ? (
        <Select
          {...register('category')}
          label={t('category')}
          placeholder={t('categoryPlaceholder')}
          options={categoryOptions}
          error={errors.category?.message}
          required
          disabled={isLoading}
        />
      ) : (
        <Input
          {...register('category')}
          label={t('category')}
          placeholder={t('categoryPlaceholder')}
          error={errors.category?.message}
          required
          disabled={isLoading}
        />
      )}

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('tags')}
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder={t('addTagPlaceholder')}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleAddTag}
            disabled={isLoading || !tagInput.trim()}
          >
            {t('add')}
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-indigo-600 hover:text-indigo-800"
                  disabled={isLoading}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.tags.message}
          </p>
        )}
      </div>

      {/* Featured Document */}
      <Checkbox
        {...register('is_featured')}
        label={t('featuredDocument')}
        disabled={isLoading}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onCancel}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? t('saving') : t('save')}
        </Button>
      </div>
    </div>
  )
}

