import React from 'react';
import { useTranslations } from 'next-intl';
import { DashboardLayout } from '@/website/organisms';
import { ChecklistContent } from '@/website/organisms/ChecklistContent/ChecklistContent';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ChecklistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch checklist items and user progress
  const checklistItemModel = (prisma as any).checklistItem;
  const userProgressModel = (prisma as any).userChecklistProgress;

  const checklistItems = checklistItemModel ? await checklistItemModel.findMany({
    orderBy: [
      { phase: 'asc' },
      { category: 'asc' },
      { created_at: 'asc' }
    ]
  }) : [];

  const userProgress = (userProgressModel && user) ? await userProgressModel.findMany({
    where: { user_id: user.id }
  }) : [];

  return (
    <DashboardLayout>
      <div className="px-10 py-12">
        <ChecklistContent 
          items={checklistItems} 
          initialProgress={userProgress} 
          userId={user.id} 
        />
      </div>
    </DashboardLayout>
  );
}
