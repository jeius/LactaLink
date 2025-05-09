'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { ThemeProvider } from './theme-provider';

const queryClient = new QueryClient();

const isDevelopment =
  process.env.VERCEL_ENV === 'development' || process.env.NODE_ENV === 'development';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
      {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
      <Toaster />
    </QueryClientProvider>
  );
}
