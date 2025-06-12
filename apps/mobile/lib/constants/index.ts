/* eslint-disable import/no-unresolved */
import {
  EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_SUPABASE_URL,
  VERCEL_AUTOMATION_BYPASS_SECRET,
} from '@env';

export * from './icons';
export * from './queryKeys';
export * from './storageKeys';

export const API_URL = EXPO_PUBLIC_API_URL;
export const RESEND_OTP = 90; // seconds
export const SUPABASE_URL = EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const VERCEL_BYPASS_TOKEN = VERCEL_AUTOMATION_BYPASS_SECRET;

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const OTP_TOAST_ID = 'otp';
export const SIGN_IN_TOAST_ID = 'sign-in';
export const SIGN_IN_WITH_OAUTH_TOAST_ID = 'sign-in-with-oauth';
export const SIGN_UP_TOAST_ID = 'sign-up';
export const SIGN_OUT = 'sign-out';
export const RESET_PASSWORD_TOAST_ID = 'reset-password';
export const UPDATE_EMAIL_TOAST_ID = 'update-email';
export const UPDATE_PASSWORD_TOAST_ID = 'update-password';
