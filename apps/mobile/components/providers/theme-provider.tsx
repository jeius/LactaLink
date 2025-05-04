'use client';

import { getTheme, updateTheme } from '@/lib/api/theme';
import { MMKV_KEYS, QUERY_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { Theme } from '@lactalink/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect } from 'react';
import { GluestackUIProvider } from '../ui/gluestack-ui-provider';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    colorScheme: theme,
    setColorScheme: setTheme,
    toggleColorScheme: toggleTheme,
  } = useColorScheme();

  const { isLoading } = useQuery({
    queryKey: QUERY_KEYS.USER_THEME,
    queryFn: async () => {
      const serverTheme = await getTheme();
      const fallbackTheme = (Storage.getString(MMKV_KEYS.THEME) as Theme) || 'system';

      const resolvedTheme = serverTheme || fallbackTheme;

      setTheme(resolvedTheme);
      Storage.set(MMKV_KEYS.THEME, resolvedTheme);

      return resolvedTheme;
    },
    initialData: () => {
      const stored = Storage.getString(MMKV_KEYS.THEME);
      return (stored as Theme) || theme || 'light';
    },
  });

  const { mutate: saveThemeToServer } = useMutation({
    mutationFn: async (newTheme: Theme) => {
      await updateTheme(newTheme);
    },
  });

  useEffect(() => {
    if (theme) {
      Storage.set(MMKV_KEYS.THEME, theme);
      saveThemeToServer(theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme: theme || 'light', setTheme, toggleTheme, isLoading }}>
      {/* <GluestackUIProvider mode={theme}>{children}</GluestackUIProvider>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} /> */}

      <GluestackUIProvider mode={'light'}>{children}</GluestackUIProvider>
      <StatusBar style={'dark'} />
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
