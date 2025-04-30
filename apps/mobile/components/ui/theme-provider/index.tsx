'use client';

import { getTheme, updateTheme } from '@/lib/api/theme';
import { MMKV_KEYS, QUERY_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { Theme } from '@lactalink/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  const { isLoading } = useQuery({
    queryKey: QUERY_KEYS.USER_THEME,
    queryFn: async () => {
      const serverTheme = await getTheme();
      setTheme(serverTheme);
      Storage.set(MMKV_KEYS.THEME, serverTheme);
      return serverTheme;
    },
    initialData: () => {
      const stored = Storage.getString(MMKV_KEYS.THEME);
      return (stored as Theme) || 'light';
    },
  });

  const { mutate: saveThemeToServer } = useMutation({
    mutationFn: async (newTheme: Theme) => {
      await updateTheme(newTheme); // save to backend
    },
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    Storage.set(MMKV_KEYS.THEME, newTheme);
    saveThemeToServer(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
