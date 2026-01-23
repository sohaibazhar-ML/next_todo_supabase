import DocumentManagement from '@/components/DocumentManagement'

interface AdminDocumentManagementPanelProps {
  title: string
}

export default function AdminDocumentManagementPanel({ title }: AdminDocumentManagementPanelProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>
      <DocumentManagement />
    </div>
  )
}
