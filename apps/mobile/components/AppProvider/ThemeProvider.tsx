'use client';

import { getTheme, updateTheme } from '@/lib/api/theme';
import { getHexColor } from '@/lib/colors';
import { MMKV_KEYS, QUERY_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { Theme } from '@lactalink/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { GluestackUIProvider } from '../ui/gluestack-ui-provider';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const deviceColorScheme = useColorScheme().colorScheme;

  const {
    colorScheme: theme,
    setColorScheme: setTheme,
    toggleColorScheme: toggleTheme,
  } = useColorScheme();

  const { isLoading } = useQuery({
    queryKey: QUERY_KEYS.USER_THEME,
    enabled: !Storage.contains(MMKV_KEYS.THEME),
    queryFn: async () => {
      const serverTheme = await getTheme();
      const fallback = serverTheme || deviceColorScheme || 'light';
      setTheme(fallback);
      return fallback;
    },
  });

  const { mutate: saveThemeToServer } = useMutation({
    mutationFn: async (newTheme: Theme) => {
      await updateTheme(newTheme);
    },
  });

  // Apply stored theme once during startup
  useEffect(() => {
    const storedTheme = Storage.getString(MMKV_KEYS.THEME) as Theme | undefined;
    if (storedTheme) {
      setTheme(storedTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist theme and update nav bar whenever it changes
  useEffect(() => {
    if (theme) {
      Storage.set(MMKV_KEYS.THEME, theme);
      saveThemeToServer(theme);

      if (Platform.OS === 'android') {
        const bgColor = getHexColor(theme, 'background', 50);
        if (bgColor) {
          NavigationBar.setBackgroundColorAsync(bgColor.toString());
          NavigationBar.setButtonStyleAsync(theme);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme: theme || 'light',
        setTheme,
        toggleTheme,
        isLoading,
      }}
    >
      <GluestackUIProvider mode={theme}>{children}</GluestackUIProvider>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
