'use client'

import { useTranslations } from 'next-intl'
import DocumentUpload from '@/components/DocumentUpload'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('uploadDocument')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <DocumentUpload onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}

