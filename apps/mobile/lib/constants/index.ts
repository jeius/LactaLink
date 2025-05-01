// eslint-disable-next-line import/no-unresolved
import { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_SUPABASE_URL } from '@env';

export const MMKV_KEYS = {
  AUTH_TOKEN: 'auth_token',
  AUTH: 'sb-session-token',
  THEME: 'theme',
  ONBOARDING: 'viewed-onboarding',
};

export const API_URL = EXPO_PUBLIC_API_URL;

export const SUPABASE_URL = EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = EXPO_PUBLIC_SUPABASE_ANON_KEY;

export * from './icons';

export * from './queryKeys';
