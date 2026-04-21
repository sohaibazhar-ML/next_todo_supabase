import React from 'react';
import { DashboardLayout, SettingsSection } from '@/website/organisms';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function SettingsPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;

  const {
    locale
  } = params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id }
  });

  if (!profile) {
    redirect('/dashboard');
  }

  // Get current locale from database or cookie or params
  const cookieStore = await cookies();
  const currentLocale = profile.preferred_language || cookieStore.get('NEXT_LOCALE')?.value || locale || 'de';

  return (
    <DashboardLayout isAccountPage activeTab="settings">
      <SettingsSection 
        firstName={profile.first_name}
        lastName={profile.last_name}
        currentLanguage={currentLocale}
        keepMeLoggedIn={profile.keep_me_logged_in}
        avatarUrl={profile.avatar_url}
      />
    </DashboardLayout>
  );
}
