'use client'

import { useTranslations } from 'next-intl'
import { DocumentUploadForm } from '@/components/forms/DocumentUploadForm'
import { IconClose } from '@/components/ui/icons'
import { THEME } from '@/constants/theme'

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  parentDocumentId?: string | null
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onSuccess,
  parentDocumentId,
}: DocumentUploadModalProps) {
  const t = useTranslations('documents')

  if (!isOpen) return null

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess()
    }
    onClose()
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${THEME.Z_INDEX.MODAL} p-4`}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('uploadDocument')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            type="button"
            aria-label="Close"
          >
            <IconClose className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <DocumentUploadForm 
            onSuccess={handleSuccess}
            parentDocumentId={parentDocumentId}
          />
        </div>
      </div>
    </div>
  )
}

