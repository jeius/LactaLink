'use client';

import { getTheme } from '@/lib/api/theme';
import { QUERY_KEYS } from '@/lib/constants';
import { STORAGE_KEYS } from '@/lib/constants/storageKeys';
import { useQuery } from '@tanstack/react-query';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: theme,
    error,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.THEME,
    queryFn: getTheme,
  });

  if (isError) {
    console.log('Failed fetching theme:', error.message);
  }

  return (
    <NextThemeProvider
      attribute="data-theme"
      defaultTheme={theme || 'system'}
      enableSystem
      storageKey={STORAGE_KEYS.THEME}
    >
      {children}
    </NextThemeProvider>
  );
};
