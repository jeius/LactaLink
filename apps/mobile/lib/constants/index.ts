/* eslint-disable import/no-unresolved */
import {
  ANDROID_MAPS_API_KEY as AndroidKey,
  EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_SUPABASE_URL,
  IOS_MAPS_API_KEY as IosKey,
  VERCEL_AUTOMATION_BYPASS_SECRET,
} from '@env';

export * from './assets';
export * from './icons';
export * from './queryKeys';
export * from './storageKeys';

export const API_URL = EXPO_PUBLIC_API_URL;
export const RESEND_OTP = 90; // seconds
export const SUPABASE_URL = EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const VERCEL_BYPASS_TOKEN = VERCEL_AUTOMATION_BYPASS_SECRET;
export const ANDROID_MAPS_API_KEY = AndroidKey;
export const IOS_MAPS_API_KEY = IosKey;

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const OTP_TOAST_ID = 'otp';
export const SIGN_IN_TOAST_ID = 'sign-in';
export const SIGN_IN_WITH_OAUTH_TOAST_ID = 'sign-in-with-oauth';
export const SIGN_UP_TOAST_ID = 'sign-up';
export const SIGN_OUT = 'sign-out';
export const RESET_PASSWORD_TOAST_ID = 'reset-password';
export const UPDATE_EMAIL_TOAST_ID = 'update-email';
export const UPDATE_PASSWORD_TOAST_ID = 'update-password';

export {
  COLLECTION_MODES,
  DAYS,
  DELIVERY_OPTIONS,
  GENDER_TYPES,
  MARITAL_STATUS,
  ORGANIZATION_TYPES,
  PRIORITY_LEVELS,
  STORAGE_TYPES,
} from '@lactalink/types';
