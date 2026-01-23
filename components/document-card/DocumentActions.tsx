/**
 * Document Actions Component
 * 
 * Displays action buttons for document (edit, download, view versions).
 */

import { useTranslations } from 'next-intl'
import { IconEdit, IconDownload } from '@/components/ui/icons'
import { Button } from '@/components/ui'

interface DocumentActionsProps {
  canEdit: boolean
  downloading: boolean
  loadingVersions: boolean
  showVersions: boolean
  onEdit: () => void
  onDownload: () => void
  onToggleVersions: () => void
}

export default function DocumentActions({
  canEdit,
  downloading,
  loadingVersions,
  showVersions,
  onEdit,
  onDownload,
  onToggleVersions,
}: DocumentActionsProps) {
  const t = useTranslations('documentCard')

  return (
    <>
      <div className="mb-4">
        <Button
          type="button"
          variant="outline"
          onClick={onToggleVersions}
          disabled={loadingVersions}
          className="w-full"
        >
          {loadingVersions ? t('loadingVersions') : showVersions ? t('hideVersions') : t('viewAllVersions')}
        </Button>
      </div>

      {canEdit && (
        <Button
          type="button"
          variant="primary"
          onClick={onEdit}
          className="w-full mb-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <IconEdit className="h-5 w-5" />
          {t('edit')}
        </Button>
      )}

      <Button
        type="button"
        variant="primary"
        onClick={onDownload}
        disabled={downloading}
        loading={downloading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
      >
        {!downloading && <IconDownload className="h-5 w-5" />}
        {downloading ? t('downloading') : t('download')}
      </Button>
    </>
  )
}

