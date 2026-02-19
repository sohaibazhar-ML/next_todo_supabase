'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import AdminDocumentManagementPanel from './AdminDocumentManagementPanel'
import DocumentUploadModal from './DocumentUploadModal'
import { IconPlus } from '@/components/ui/icons'

interface AdminDocumentManagementWithUploadProps {
  managementTitle: string
}

export default function AdminDocumentManagementWithUpload({
  managementTitle,
}: AdminDocumentManagementWithUploadProps) {
  const t = useTranslations('documents')
  const router = useRouter()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false)
    // Refresh the page to show the new document
    router.refresh()
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('documentManagement')}
          </h1>
          <p className="mt-1 text-gray-600">{t('uploadDocument')}</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
        >
          <IconPlus className="w-5 h-5" />
          {t('uploadDocument')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <AdminDocumentManagementPanel title={managementTitle} />
      </div>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </>
  )
}

