import React from 'react';
import { DashboardLayout, MyDocumentsContent } from '@/website/organisms';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatBytes } from '@/website/utils/formatters';
import { Prisma } from '@prisma/client';
import { DocumentItem } from '@/website/types';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyDocumentsPage(props: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'created_at';
  const order = typeof searchParams.order === 'string' ? searchParams.order : 'desc';
  const limit = 20;
  const skip = (page - 1) * limit;

  // Fetch only the current user's uploaded documents
  const where: Prisma.documentsWhereInput = {
    created_by: user.id,
    ...(q ? {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
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
      filePath: doc.file_path,
      category: doc.category,
      recipient: doc.recipient || undefined,
      createdAt: doc.created_at?.toISOString()
    };
  });

  return (
    <DashboardLayout isAccountPage activeTab="my-documents">
      <MyDocumentsContent
        documents={documents}
        totalPages={totalPages}
        currentPage={page}
        sortField={sort}
        sortOrder={order as 'asc' | 'desc'}
      />
    </DashboardLayout>
  );
}
