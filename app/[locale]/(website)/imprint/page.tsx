import React from 'react';
import { Header, Footer, ImprintContent } from '@/website/organisms';

export const metadata = {
  title: 'Imprint',
  description: 'Legal information and contact details for mySwissMove.',
};

export default function ImprintPage() {
  return (
    <main className="min-h-screen flex flex-col font-heading bg-background-neutral">
      <Header />
      
      <div className="flex-grow pt-[100px]">
        <ImprintContent />
      </div>

      <Footer />
    </main>
  );
}
