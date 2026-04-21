import { DashboardLayout, DashboardOverview } from '@/website/organisms';
import { Prisma } from '@prisma/client';
import { getDocuments, getDocumentsCount } from '@/app/_services/website/document-service';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: PageProps) {
  // We keep the logic for future use but show the static overview as requested
  return (
    <DashboardLayout activeTab="dashboard">
      <DashboardOverview />
    </DashboardLayout>
  );
}
