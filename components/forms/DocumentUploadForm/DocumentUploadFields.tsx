/**
 * Document Upload Form Fields
 * 
 * Reusable form fields component for document upload form.
 * Uses react-hook-form for form state management.
 */

import React from 'react'
import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import type { DocumentUploadFormData } from './documentUploadSchema'
import { Input, Textarea, Select, Checkbox, Button } from '@/components/ui'
import { useDocumentFilterOptions } from '@/hooks/api/useDocuments'
import { DEFAULT_VALUES, FILE_EXTENSIONS } from '@/constants'
import { useTagInput } from '@/hooks/useTagInput'

export interface DocumentUploadFieldsProps {
  /**
   * React Hook Form instance
   */
  form: UseFormReturn<DocumentUploadFormData>
  
  /**
   * Whether form is in loading state
   */
  isLoading?: boolean
  
  /**
   * Whether parent document is loading (for version uploads)
   */
  loadingParent?: boolean
  
  /**
   * Parent document info (for version uploads)
   */
  parentDocument?: {
    title: string
    version: string | null
  } | null
}

export default function DocumentUploadFields({
  form,
  isLoading = false,
  loadingParent = false,
  parentDocument,
}: DocumentUploadFieldsProps) {
  const t = useTranslations('documentUpload')
  const { data: filterOptions } = useDocumentFilterOptions()
  
  const {
    register,
    formState: { errors },
    setValue,
  } = form

  // Use centralized tag input hook
  const {
    tagInput,
    setTagInput,
    tags,
    handleAddTag,
    handleRemoveTag,
    handleTagKeyPress,
  } = useTagInput({ form })

  // Get categories for select dropdown
  const categoryOptions = filterOptions?.categories.map((cat) => ({
    value: cat,
    label: cat,
  })) || []

  return (
    <div className="space-y-4">
      {/* Parent Document Info (for version uploads) */}
      {parentDocument && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm text-blue-700 font-medium mb-2">
            {t('uploadingNewVersion')}
          </p>
          {loadingParent ? (
            <p className="text-xs text-blue-600">{t('loadingParentDocument')}</p>
          ) : (
            <div className="text-xs text-blue-600 space-y-1">
              <p>
                {t('parent')}: {parentDocument.title}
              </p>
              <p>
                {t('currentVersion')}:{' '}
                {parentDocument.version || '1.0'}
              </p>
              <p className="mt-2 text-blue-700">{t('formPrefilled')}</p>
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <Input
        {...register('title')}
        label={t('title')}
        placeholder={t('titlePlaceholder')}
        error={errors.title?.message}
        required
        disabled={loadingParent || isLoading}
      />

      {/* Description */}
      <Textarea
        {...register('description')}
        label={t('description')}
        placeholder={t('descriptionPlaceholder')}
        error={errors.description?.message}
        rows={3}
        disabled={loadingParent || isLoading}
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
          disabled={loadingParent || isLoading}
        />
      ) : (
        <Input
          {...register('category')}
          label={t('category')}
          placeholder={t('categoryPlaceholder')}
          error={errors.category?.message}
          required
          disabled={loadingParent || isLoading}
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
          <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
        )}
      </div>

      {/* File Upload */}
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
          {t('file')} <span className="text-red-500">*</span>
        </label>
        <input
          {...register('file', {
            onChange: (e) => {
              const file = e.target.files?.[0]
              if (file) {
                setValue('file', file, { shouldValidate: true })
              }
            },
          })}
          id="file-upload"
          type="file"
          accept={Object.values(FILE_EXTENSIONS).join(',')}
          disabled={isLoading}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {errors.file && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.file.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">{t('allowedFormats')}</p>
      </div>

      {/* Featured Document */}
      <Checkbox
        {...register('is_featured')}
        label={t('featuredDocument')}
        disabled={isLoading}
      />

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          disabled={isLoading || loadingParent}
          fullWidth
        >
          {isLoading ? t('uploading') : parentDocument ? t('uploadNewVersion') : t('uploadDocument')}
        </Button>
      </div>
    </div>
  )
}

