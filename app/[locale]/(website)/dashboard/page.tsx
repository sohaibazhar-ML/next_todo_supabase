import { DashboardLayout, DashboardOverview } from '@/website/organisms';
import { Prisma } from '@prisma/client';
import { getDocuments, getDocumentsCount } from '@/app/_services/website/document-service';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Calculate progress based on checklist items
  // Using defensive access to avoid runtime crashes if models are missing
  const checklistItemModel = (prisma as any).checklistItem;
  const userProgressModel = (prisma as any).userChecklistProgress;

  let progressPercent = 0;
  if (checklistItemModel && userProgressModel) {
    const totalItems = await checklistItemModel.count();
    const completedItems = await userProgressModel.count({
      where: {
        user_id: user.id,
        is_completed: true
      }
    });
    progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  } else {
    console.warn('Checklist models not found on prisma client');
  }

  // Fetch featured documents
  const featuredDocuments = await prisma.documents.findMany({
    where: { is_featured: true },
    take: 9
  });

  // Fetch checklist items to show as cards
  const checklistCards = checklistItemModel ? await checklistItemModel.findMany({
    take: 9,
    orderBy: { created_at: 'asc' }
  }) : [];

  return (
    <DashboardLayout activeTab="dashboard">
      <DashboardOverview 
        progressPercent={progressPercent} 
        featuredDocuments={featuredDocuments} 
        checklistCards={checklistCards}
      />
    </DashboardLayout>
  );
}
