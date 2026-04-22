import { DashboardLayout, DocumentList } from '@/website/organisms';
import { DocumentItem } from '@/website/types';
import { formatBytes } from '@/website/utils/formatters';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

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
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'title';
  const order = typeof searchParams.order === 'string' ? searchParams.order : 'asc';

  // Fetch ALL documents with dynamic sorting
  const where: Prisma.documentsWhereInput = {
    is_featured: true,
    ...(q ? {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { recipient: { contains: q, mode: 'insensitive' } },
        { file_type: { contains: q, mode: 'insensitive' } },
        { file_name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    } : {})
  };

  const [totalCount, dbDocuments] = await Promise.all([
    prisma.documents.count({ where }),
    prisma.documents.findMany({
      where,
      orderBy: { [sort]: order },
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
    <DashboardLayout activeTab="all-documents" showSearch>
      <DocumentList 
        documents={documents} 
        totalPages={totalPages}
        currentPage={page}
        sortField={sort}
        sortOrder={order as 'asc' | 'desc'}
      />
    </DashboardLayout>
  );
}
