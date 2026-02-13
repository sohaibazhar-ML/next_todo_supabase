import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from '@/lib/providers/QueryProvider'

export const metadata: Metadata = {
  title: "Document Portal",
  description: "Document management and download portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
