"use client";
import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header, LoginForm, Footer } from '@/website/organisms';
import { Popup } from '@/website/molecules';

/**
 * LoginContent handles the client-side logic for displaying the 
 * confirmation popup and passing messages to the LoginForm.
 */
function LoginContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('Login');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  useEffect(() => {
    // Check if the user just confirmed their email
    if (searchParams.get('confirmed') === 'true') {
      setShowConfirmation(true);
    }
  }, [searchParams]);

  return (
    <>
      {/* Login Page Content */}
      <div className="w-full flex-grow flex flex-col items-center pt-[100px] md:pt-[120px] pb-24">
        <div className="max-w-(--container-width-desktop) w-full px-(--spacing-container-padding)">
          <LoginForm 
            initialSuccessMessage={searchParams.get('confirmed') === 'true' ? t('confirmation.redirect') : undefined}
          />
        </div>
      </div>
      
      {/* Success Popup */}
      <Popup
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title={t('confirmation.title')}
        description={t('confirmation.description')}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background-neutral flex flex-col items-center text-secondary">
      <Header />
      
      <Suspense fallback={<div className="flex-grow" />}>
        <LoginContent />
      </Suspense>

      <Footer />
    </main>
  );
}
