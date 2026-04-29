import React from 'react';
import { Header, Footer, GtcContent } from '@/website/organisms';

export const metadata = {
  title: 'GTC',
  description: 'General Terms and Conditions for using the mySwissMove platform.',
};

export default function GtcPage() {
  return (
    <main className="min-h-screen flex flex-col font-heading bg-background-neutral">
      <Header />
      
      <div className="flex-grow pt-[100px]">
        <GtcContent />
      </div>

      <Footer />
    </main>
  );
}
