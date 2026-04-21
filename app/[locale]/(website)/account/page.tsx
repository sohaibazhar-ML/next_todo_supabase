import React from 'react';
import { DashboardLayout, ProfileSection } from '@/website/organisms';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AccountPage() {
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

  return (
    <DashboardLayout isAccountPage activeTab="profile">
      <ProfileSection 
        firstName={profile.first_name}
        lastName={profile.last_name}
        email={profile.email}
        phoneNumber={profile.phone_number || ''}
        currentAddress={profile.current_address}
        countryOfOrigin={profile.country_of_origin}
        newAddressSwitzerland={profile.new_address_switzerland}
        avatarUrl={profile.avatar_url}
      />
    </DashboardLayout>
  );
}
