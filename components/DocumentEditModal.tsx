/**
 * Document Edit Modal Component
 * 
 * Modal wrapper for DocumentEditForm component.
 * Uses the refactored DocumentEditForm with React Hook Form and React Query.
 */

'use client'

import { useTranslations } from 'next-intl'
import type { Document } from '@/types/document'
import { DocumentEditForm } from '@/components/forms/DocumentEditForm'
import Modal from '@/components/ui/Modal'
import { IconClose } from '@/components/ui/icons'

interface DocumentEditModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function DocumentEditModal({
  document,
  isOpen,
  onClose,
  onSave,
}: DocumentEditModalProps) {
  const t = useTranslations('documentEditModal')

  if (!document) return null

  const handleSuccess = () => {
    onSave()
    onClose()
  }

  const modalTitle = document.version
    ? `${t('editDocument')} (${t('version')} ${document.version})`
    : t('editDocument')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="2xl"
      contentClassName="p-6"
    >
      <DocumentEditForm
        documentId={document.id}
        document={document}
        onSuccess={handleSuccess}
        onCancel={onClose}
      />
    </Modal>
  )
}

