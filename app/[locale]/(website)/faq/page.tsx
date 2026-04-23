import React from 'react';
import { useTranslations } from 'next-intl';
import { Header, Footer, FaqSection } from '@/website/organisms';

export default function FaqPage() {
  const t = useTranslations('FAQ');

  // Mapping the 10 FAQ items from the translation files
  const itemsCount = 10;
  const faqItems = Array.from({ length: itemsCount }).map((_, index) => ({
    question: t(`items.${index}.question`),
    answer: t(`items.${index}.answer`),
  }));

  return (
    <main className="min-h-screen bg-transparent flex flex-col">
      <Header />

      {/* Spacer for Fixed Header */}
      <div className="h-[120px] lg:h-[140px]" />

      <FaqSection
        title={t('title')}
        items={faqItems}
      />

      <Footer />
    </main>
  );
}
