import {
  ANDROID_MAPS_API_KEY as AndroidKey,
  EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_SUPABASE_URL,
  IOS_MAPS_API_KEY as IosKey,
  EXPO_THEME as ThemeOverride,
  VERCEL_AUTOMATION_BYPASS_SECRET,
  GOOGLE_IOS_CLIENT_ID as googleIosClientID,
  GOOGLE_WEB_CLIENT_ID as googleWebClientID,
} from '@env';

export const API_URL = EXPO_PUBLIC_API_URL;

export const SUPABASE_URL = EXPO_PUBLIC_SUPABASE_URL;

export const SUPABASE_ANON_KEY = EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const VERCEL_BYPASS_TOKEN = VERCEL_AUTOMATION_BYPASS_SECRET;

export const ANDROID_MAPS_API_KEY = AndroidKey;

export const IOS_MAPS_API_KEY = IosKey;

export const THEME_OVERRIDE = ThemeOverride;

export const GOOGLE_IOS_CLIENT_ID = googleIosClientID;

export const GOOGLE_WEB_CLIENT_ID = googleWebClientID;
