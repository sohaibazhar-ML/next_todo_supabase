import React from 'react';
import { DashboardHeader, DocumentList, Footer } from '@/website/organisms';
import { DocumentItem } from '@/website/types';
import { prisma } from '@/lib/prisma';
import { formatBytes } from '@/website/utils/formatters';
import { Prisma } from '@prisma/client';

export default async function DashboardPage() {
  // Fetch active documents from the database
  const dbDocuments = await prisma.documents.findMany({
    where: {
      is_active: true
    },
    orderBy: {
      created_at: 'desc'
    }
  });

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
        <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding) grid grid-cols-12 gap-x-(--spacing-gutter)">
          <div className="col-span-12">
            <DocumentList documents={documents} />
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <Footer />
    </main>
  );
}
