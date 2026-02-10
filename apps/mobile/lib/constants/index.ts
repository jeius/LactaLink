import { URGENCY_LEVELS } from '@lactalink/enums';
import { Coordinates } from '@lactalink/types';

export * from './assets';
export * from './deviceBreakpoints';
export * from './env';
export * from './queryKeys';
export * from './storageKeys';
export * from './toastIDs';

export const RESEND_OTP = 90; // seconds

export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
export const IMAGE_COMPRESSION_SIZE = 2048; // 2048px (max width or height)

export const BACK_TOAST_ID = 'back-toast-id';
export const AUTH_TOAST_ID = 'auth-toast-id';

export const BLUR_HASH =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export const PHILIPPINES_COORDINATES: Coordinates = {
  latitude: 12.8797,
  longitude: 121.774,
};

export const PRIORITY_LEVEL_COLORS: Record<keyof typeof URGENCY_LEVELS, string> = {
  LOW: 'success-400',
  MEDIUM: 'secondary-400',
  HIGH: 'warning-400',
  CRITICAL: 'error-400',
};

export const TEMP_ID_PREFIX = 'temp';
