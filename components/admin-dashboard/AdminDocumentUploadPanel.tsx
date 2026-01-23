import { DocumentUploadForm } from '@/components/forms/DocumentUploadForm'

interface AdminDocumentUploadPanelProps {
  title: string
}

export default function AdminDocumentUploadPanel({ title }: AdminDocumentUploadPanelProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
      <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>
      <DocumentUploadForm />
    </div>
  )
}
