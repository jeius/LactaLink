import { getApiClient } from '@lactalink/api';
import { Theme, TutorialState } from '@lactalink/types';
import { MMKV_KEYS } from '../constants';
import localStorage from '../localStorage';

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

export async function updateTutorialState(state: TutorialState) {
  const client = getApiClient();
  const user = await client.auth.getMeUser();

  if (!user) return;

  const userID = user.id;

  const tutorialKey = MMKV_KEYS.TUTORIAL_STATE.trim();
  const storageKey = tutorialKey + '-' + userID.trim();

  localStorage.set(storageKey, JSON.stringify(state));

  return await client.updatePreference<TutorialState>(tutorialKey, state);
}

export async function getTutorialState(userID: string): Promise<TutorialState> {
  const client = getApiClient();
  const tutorialKey = MMKV_KEYS.TUTORIAL_STATE.trim();
  const storageKey = tutorialKey + '-' + userID.trim();
  const storedState = localStorage.getString(storageKey);

  if (storedState) {
    return JSON.parse(storedState) as TutorialState;
  }

  const state = await client.getPreference<TutorialState>(tutorialKey);
  if (state) {
    localStorage.set(storageKey, JSON.stringify(state));
  }

  return state;
}
