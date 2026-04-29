import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ClientLayout } from './ClientLayout';
import { NavigationHandler } from '@/app/_components/website/atoms/NavigationHandler/NavigationHandler';
import { NetworkStatus } from '@/website/atoms';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["monospace"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <NextIntlClientProvider messages={messages}>
        <NetworkStatus />
        <ClientLayout>
          <Suspense fallback={null}>
            <NavigationHandler />
          </Suspense>
          {children}
        </ClientLayout>
      </NextIntlClientProvider>
    </div>
  );
}
