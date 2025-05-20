/* eslint-disable import/no-unresolved */
import {
  EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_SUPABASE_URL,
  VERCEL_AUTOMATION_BYPASS_SECRET,
} from '@env';

export const API_URL = EXPO_PUBLIC_API_URL;
export const RESEND_OTP = 90; // seconds
export const SUPABASE_URL = EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const VERCEL_BYPASS_TOKEN = VERCEL_AUTOMATION_BYPASS_SECRET;

export * from './icons';
export * from './queryKeys';
export * from './storageKeys';

export { SETUP_PROFILE_STEPS } from './profiles';

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB in bytes
