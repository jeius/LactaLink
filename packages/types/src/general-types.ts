import {
  DAYS,
  DELIVERY_OPTIONS,
  DONATION_REQUEST_STATUS,
  GENDER_TYPES,
  ID_STATUS,
  ID_TYPES,
} from '@lactalink/enums';

export type Theme = 'light' | 'dark';
export type ImageData = {
  uri: string | null;
  alt: string;
  blurHash: string;
};

export type DonationRequestStatus = keyof typeof DONATION_REQUEST_STATUS;
export type DeliveryMode = [keyof typeof DELIVERY_OPTIONS][number];
export type DeliveryDays = [keyof typeof DAYS][number];

export type IDType = keyof typeof ID_TYPES;
export type IDStatus = keyof typeof ID_STATUS;
export type Gender = keyof typeof GENDER_TYPES;
