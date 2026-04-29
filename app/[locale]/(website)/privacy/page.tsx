import React from 'react';
import { Header, Footer, PrivacyContent } from '@/website/organisms';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for the mySwissMove platform. We value your data security.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col font-heading bg-background-neutral">
      <Header />
      
      <div className="flex-grow pt-[100px]">
        <PrivacyContent />
      </div>

      <Footer />
    </main>
  );
}
