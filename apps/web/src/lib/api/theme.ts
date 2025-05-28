'use server';

import { Theme } from '@lactalink/types';
import { getServerApi } from './getServerApi';

const THEME_KEY = 'theme';

export async function getTheme(): Promise<Theme> {
  const apiClient = await getServerApi();
  const theme = await apiClient.getPreference<Theme>(THEME_KEY);
  return theme;
}

export async function updateTheme(theme: Theme) {
  const apiClient = await getServerApi();
  await apiClient.updatePreference<Theme>(THEME_KEY, theme);
}
