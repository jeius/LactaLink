export * from './collections';
export * from './reactQueryKeys';
export * from './storageKeys';

export const PSGC_API_URL = process.env.PSGC_API_URL;

export const SEED_REGIONS_BATCH_SIZE = 50;

export const SEED_PROVINCES_BATCH_SIZE = 100;

export const SEED_CITIES_MUNICIPALITIES_BATCH_SIZE = 250;

export const SEED_BARANGAYS_BATCH_SIZE = 250;

export const BATCH_INDEX_KEY = 'batchIndex';

export const DOC_LOCK_DURATION = 60;

export const SESSION_NAME = 'sb-session-token';

export const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;
export const RESEND_OTP = 90; // seconds
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const VERCEL_BYPASS_TOKEN = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const OTP_TOAST_ID = 'otp';
export const SIGN_IN_TOAST_ID = 'sign-in';
export const SIGN_IN_WITH_OAUTH_TOAST_ID = 'sign-in-with-oauth';
export const SIGN_UP_TOAST_ID = 'sign-up';
export const SIGN_OUT = 'sign-out';
export const RESET_PASSWORD_TOAST_ID = 'reset-password';
export const UPDATE_EMAIL_TOAST_ID = 'update-email';
export const UPDATE_PASSWORD_TOAST_ID = 'update-password';
