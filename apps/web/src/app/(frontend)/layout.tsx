import Providers from '@/components/providers';
import { initServerApi } from '@/lib/api/init/server';
import { getServerSideURL } from '@/lib/utils/getURL';
import { mergeOpenGraph } from '@/lib/utils/mergeOpenGraph';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import React from 'react';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize the server API client
  // This is necessary for server-side rendering to work correctly
  await initServerApi();

  return (
    <html className={`${plusJakartaSans.variable}`} lang="en" suppressHydrationWarning>
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="relative">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
};
