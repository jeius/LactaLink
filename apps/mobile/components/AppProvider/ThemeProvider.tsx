'use client';

import { getTheme, updateTheme as updateServerTheme } from '@/lib/api/payload-preferences';
import { MMKV_KEYS, QUERY_KEYS, THEME_OVERRIDE } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { Theme } from '@lactalink/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { Platform } from 'react-native';
import { GluestackUIProvider } from '../ui/gluestack-ui-provider';

import { getThemeColors } from '@/lib/colors';
import { useThemeStore } from '@/lib/stores/themeStore';
import { ThemeColors } from '@/lib/types/colors';
import * as NavigationBar from 'expo-navigation-bar';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isLoading: boolean;
  themeColors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const storedTheme = Storage.getString(MMKV_KEYS.THEME) as Theme | undefined;

  const { colorScheme: theme = 'light', setColorScheme } = useColorScheme();
  const themeColors = getThemeColors(theme);

  const setThemeStore = useThemeStore((s) => s.setTheme);

  const updateTheme = useCallback(
    (newTheme: Theme) => {
      // Update color scheme for nativewind
      setColorScheme(newTheme);
      // Persist to storage
      Storage.set(MMKV_KEYS.THEME, newTheme);
      // Update zustand store
      setThemeStore(newTheme);
    },
    [setColorScheme, setThemeStore]
  );

  const { isLoading } = useQuery({
    enabled: !storedTheme, // Only fetch from server if no stored theme
    queryKey: QUERY_KEYS.USER_THEME,
    queryFn: async () => {
      const serverTheme = await getTheme();
      if (serverTheme) updateTheme(serverTheme);
      return serverTheme;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 3,
  });

  const { mutateAsync: setTheme } = useMutation({
    mutationFn: updateServerTheme,
    onMutate: (newTheme) => {
      // Optimistic update
      updateTheme(newTheme);
      return { previousTheme: theme };
    },
    onError: (err, _newTheme, context) => {
      // Revert to previous theme on error
      if (context?.previousTheme) {
        updateTheme(context.previousTheme);
      }
      console.error('Failed to save theme to server:', err);
    },
  });

  // On mount, initialize theme from storage if available
  useEffect(() => {
    if (THEME_OVERRIDE) {
      updateTheme(THEME_OVERRIDE);
    } else if (storedTheme) {
      updateTheme(storedTheme);
    } else {
      // No stored theme, use system preference
      updateTheme(theme);
    }
  }, [storedTheme, theme, updateTheme]);

  // Sync system UI and navigation bar with theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setStyle(theme);
    }
  }, [theme]);

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isLoading,
        themeColors,
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
