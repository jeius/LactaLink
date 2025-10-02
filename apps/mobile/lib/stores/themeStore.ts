import { Theme } from '@lactalink/types';
import { create } from 'zustand/react';
import { colorsConfig } from '../colors/config';
import { ThemeColors } from '../types/colors';

interface ThemeState {
  theme: Theme;
  themeColors: ThemeColors;
  setTheme: (newTheme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Don't initialize with stored theme here - we'll let ThemeProvider handle that
  // Use light as a temporary default that will be overridden immediately
  const defaultTheme: Theme = 'light';

  return {
    theme: defaultTheme,
    themeColors: colorsConfig[defaultTheme],
    setTheme: (newTheme) =>
      set(() => ({
        theme: newTheme,
        themeColors: colorsConfig[newTheme],
      })),
  };
});

export function getTheme() {
  return useThemeStore.getState().theme;
}
