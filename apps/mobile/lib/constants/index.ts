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

export const BLUR_HASH =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export const PHILIPPINES_COORDINATES = {
  latitude: 12.8797,
  longitude: 121.774,
};
