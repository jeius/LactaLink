'use client';
import { colorsConfig } from '@/lib/colors';
import { resolveThemeConfig } from '@/lib/colors/resolveThemeConfig';

export type Config = {
  light: Record<string, string>;
  dark: Record<string, string>;
};

export const config: Config = resolveThemeConfig(colorsConfig);
