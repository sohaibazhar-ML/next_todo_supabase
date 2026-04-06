import React from 'react';
import { Header, Footer, ResetPasswordForm } from '@/website/organisms';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col font-heading bg-background-neutral">
      <Header />
      
      <main className="flex-grow flex flex-col items-center pt-[100px] md:pt-[120px] pb-24">
        <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding)">
          <ResetPasswordForm className="animate-in fade-in slide-in-from-bottom-4 duration-500" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
