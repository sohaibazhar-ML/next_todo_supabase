/**
 * Document Tags Component
 * 
 * Displays document tags with "more" indicator if there are more than 3 tags.
 */

import { useTranslations } from 'next-intl'

interface DocumentTagsProps {
  tags: string[]
  maxVisible?: number
}

export default function DocumentTags({ tags, maxVisible = 3 }: DocumentTagsProps) {
  const t = useTranslations('documentCard')

  if (!tags || tags.length === 0) {
    return null
  }

  const visibleTags = tags.slice(0, maxVisible)
  const remainingCount = tags.length - maxVisible

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
        >
          {tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
          {t('more', { count: remainingCount })}
        </span>
      )}
    </div>
  )
}

