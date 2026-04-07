import React from 'react';
import { DashboardHeader, Footer, ProfileSection } from '@/website/organisms';
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
    <main className="min-h-screen bg-background-secondary flex flex-col font-heading">
      {/* Account Specific Header (Search Hidden, Account Nav Active) */}
      <DashboardHeader isAccountPage activeTab="profile" />

      {/* Profile Content with High Fidelity Design */}
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

      {/* Global Footer */}
      <Footer />
    </main>
  );
}
