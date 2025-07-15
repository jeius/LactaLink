'use client';

import { getTheme, updateTheme } from '@/lib/api/theme';
import { MMKV_KEYS, QUERY_KEYS, THEME_OVERRIDE } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { Theme } from '@lactalink/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { GluestackUIProvider } from '../ui/gluestack-ui-provider';

import { getHexColor } from '@/lib/colors';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

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
    colorScheme,
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

  const theme = THEME_OVERRIDE || colorScheme;

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

      const bgColor = getHexColor(theme, 'background', 50);
      SystemUI.setBackgroundColorAsync(bgColor || null);

      if (Platform.OS === 'android') {
        NavigationBar.setStyle(theme);
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
      <StatusBar
        animated={true}
        hideTransitionAnimation="slide"
        style={theme === 'light' ? 'dark' : 'light'}
      />
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
