/* eslint-disable import/no-unresolved */
import {
  ANDROID_MAPS_API_KEY as AndroidKey,
  EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_SUPABASE_URL,
  IOS_MAPS_API_KEY as IosKey,
  EXPO_THEME as ThemeOverride,
  VERCEL_AUTOMATION_BYPASS_SECRET,
} from '@env';

import { URGENCY_LEVELS } from '@lactalink/enums';
export * from '@lactalink/enums';

export * from './assets';
export * from './queryKeys';
export * from './storageKeys';

export const API_URL = EXPO_PUBLIC_API_URL;
export const RESEND_OTP = 90; // seconds
export const SUPABASE_URL = EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const VERCEL_BYPASS_TOKEN = VERCEL_AUTOMATION_BYPASS_SECRET;
export const ANDROID_MAPS_API_KEY = AndroidKey;
export const IOS_MAPS_API_KEY = IosKey;
export const THEME_OVERRIDE = ThemeOverride;

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const BACK_TOAST_ID = 'back-toast-id';

export const BLUR_HASH =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export const PHILIPPINES_COORDINATES = {
  latitude: 12.8797,
  longitude: 121.774,
};

export const PRIORITY_LEVEL_COLORS: Record<keyof typeof URGENCY_LEVELS, string> = {
  LOW: 'success-400',
  MEDIUM: 'secondary-400',
  HIGH: 'warning-400',
  CRITICAL: 'error-400',
};
