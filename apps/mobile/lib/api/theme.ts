import { getApiClient } from '@lactalink/api';
import { Theme } from '@lactalink/types';
import { MMKV_KEYS } from '../constants';

export async function getTheme(): Promise<Theme | null> {
  const client = getApiClient();
  const themeKey = MMKV_KEYS.THEME;
  const theme = await client.getPreference<Theme>(themeKey);
  return theme;
}

export async function updateTheme(theme: Theme) {
  const client = getApiClient();
  const themeKey = MMKV_KEYS.THEME;
  return await client.updatePreference(themeKey, theme);
}
