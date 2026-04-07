import React from 'react';
import { DashboardHeader, DocumentList, Footer } from '@/website/organisms';
import { DocumentItem } from '@/website/types';
import { prisma } from '@/lib/prisma';
import { formatBytes } from '@/website/utils/formatters';
import { Prisma } from '@prisma/client';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  // Fetch active documents with optional search and pagination
  const where: Prisma.documentsWhereInput = {
    is_active: true,
    ...(q ? { title: { contains: q, mode: 'insensitive' } } : {})
  };

  const [totalCount, dbDocuments] = await Promise.all([
    prisma.documents.count({ where }),
    prisma.documents.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Map database documents to the format expected by the UI
  const documents: DocumentItem[] = dbDocuments.map((doc: Prisma.documentsGetPayload<{}>) => {
    // Map internal database strings to UI icon identifiers
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
      url: '#' 
    };
  });

  return (
    <main className="min-h-screen bg-background-neutral flex flex-col">
      {/* Dashboard Specific Header */}
      <DashboardHeader activeTab="documents" />

      {/* Main Content Area */}
      <section className="flex-1 w-full flex justify-center pt-10 pb-24 bg-background-secondary mb-50">
        <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-10 flex flex-col items-center">
          <div className="w-full">
            <DocumentList 
              documents={documents} 
              totalPages={totalPages}
              currentPage={page}
            />
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </main>
  );
}
