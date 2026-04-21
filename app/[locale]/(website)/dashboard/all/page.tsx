import { DashboardLayout, DocumentList } from '@/website/organisms';
import { DocumentItem } from '@/website/types';
import { formatBytes } from '@/website/utils/formatters';
import { Prisma } from '@prisma/client';
import { getDocuments, getDocumentsCount } from '@/app/_services/website/document-service';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AllDocumentsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  // Fetch ALL documents sorted A-Z
  const where: Prisma.documentsWhereInput = {
    ...(q ? { title: { contains: q, mode: 'insensitive' } } : {})
  };

  const [totalCount, dbDocuments] = await Promise.all([
    getDocumentsCount(where),
    getDocuments({
      where,
      orderBy: { title: 'asc' }, // Sort A-Z as requested by page name
      skip,
      take: limit
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const documents: DocumentItem[] = dbDocuments.map((doc: any) => {
    let uiType: 'pdf' | 'doc' | 'xls' | 'zip' | 'other' = 'other';
    const dbType = doc.file_type?.toLowerCase();

    if (dbType === 'pdf') uiType = 'pdf';
    else if (dbType === 'document') uiType = 'doc';
    else if (dbType === 'spreadsheet') uiType = 'xls';
    else if (dbType === 'archive') uiType = 'zip';

    return {
      id: doc.id,
      name: doc.title,
      type: uiType,
      size: formatBytes(doc.file_size),
      url: '#',
      category: doc.category,
      recipient: doc.recipient || undefined
    };
  });

  return (
    <DashboardLayout activeTab="all-documents">
      <DocumentList 
        documents={documents} 
        totalPages={totalPages}
        currentPage={page}
      />
    </DashboardLayout>
  );
}
