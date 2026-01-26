/**
 * Document Search Fields Component
 * 
 * Reusable component for rendering document search form fields.
 */

import { useTranslations } from 'next-intl'
import type { UseFormReturn } from 'react-hook-form'
import type { DocumentSearchFormData } from './documentSearchSchema'
import type { DocumentFileType } from '@/types/document'
import { IconSearch } from '@/components/ui/icons'
import { Button, Input, Select, Checkbox } from '@/components/ui'

export interface DocumentSearchFieldsProps {
  /**
   * React Hook Form instance
   */
  form: UseFormReturn<DocumentSearchFormData>
  
  /**
   * Available categories
   */
  categories: string[]
  
  /**
   * Available file types
   */
  fileTypes: string[]
  
  /**
   * Available tags
   */
  tags: string[]
  
  /**
   * Reset handler
   */
  onReset: () => void
  
  /**
   * Whether form has active filters
   */
  hasActiveFilters: boolean
}

export default function DocumentSearchFields({
  form,
  categories,
  fileTypes,
  tags,
  onReset,
  hasActiveFilters,
}: DocumentSearchFieldsProps) {
  const t = useTranslations('documentSearch')
  
  const {
    register,
    watch,
    formState: { errors },
  } = form

  const searchQuery = watch('searchQuery')
  const category = watch('category')
  const fileType = watch('fileType')
  const selectedTags = watch('tags') || []
  const featuredOnly = watch('featuredOnly')

  const handleTagToggle = (tag: string) => {
    const currentTags = selectedTags
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    form.setValue('tags', newTags)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconSearch className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            {...register('searchQuery')}
            type="text"
            placeholder={t('searchPlaceholder')}
            className="pl-10"
            error={errors.searchQuery?.message}
          />
        </div>
        <Button type="submit" variant="primary">
          {t('search')}
        </Button>
        {hasActiveFilters && (
          <Button type="button" variant="secondary" onClick={onReset}>
            {t('reset')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          {...register('category')}
          label={t('category')}
          error={errors.category?.message}
          options={[
            { value: '', label: t('allCategories') },
            ...categories.map((cat) => ({ value: cat, label: cat })),
          ]}
        />

        <Select
          {...register('fileType')}
          label={t('fileType')}
          error={errors.fileType?.message}
          options={[
            { value: '', label: t('allTypes') },
            ...fileTypes.map((type) => ({ value: type, label: type })),
          ]}
        />

        <div className="flex items-end">
          <Checkbox
            {...register('featuredOnly')}
            label={t('featuredOnly')}
          />
        </div>
      </div>

      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('tags')}
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {t('tagsSelected', { count: selectedTags.length })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

