import type { Metadata } from "next";
import { Figtree, Poppins } from "next/font/google";
import "./globals.css";
import { QueryProvider } from '@/lib/providers/QueryProvider'

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: 'swap',
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-secondary",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: "%s | MySwissMove",
    default: "MySwissMove - Document Portal",
  },
  description: "Your official Swiss move document management and download portal. Manage your transition with ease.",
  metadataBase: new URL('https://myswissmove.ch'), // Example domain
  openGraph: {
    title: "MySwissMove - Document Portal",
    description: "Your official Swiss move document management and download portal.",
    url: 'https://myswissmove.ch',
    siteName: 'MySwissMove',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${figtree.variable} ${poppins.variable}`}>
      <body suppressHydrationWarning className="font-body text-foreground bg-background-neutral antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
