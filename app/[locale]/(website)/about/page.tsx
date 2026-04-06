import React from 'react';
import { Header, Footer, AboutHero, AboutInfo, AboutPartners } from '@/website/organisms';

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col font-heading">
      <Header />
      
      <div className="flex-grow pt-[40px] lg:pt-[60px]">
        <AboutHero />
        <AboutInfo />
        <AboutPartners />
      </div>

      <Footer />
    </main>
  );
}
