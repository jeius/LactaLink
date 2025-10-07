import { DAYS, DELIVERY_OPTIONS, DONATION_REQUEST_STATUS } from '@lactalink/enums';

export type Theme = 'light' | 'dark';
export type ImageData = {
  uri: string | null;
  alt: string;
  blurHash: string;
};

export type DonationRequestStatus = keyof typeof DONATION_REQUEST_STATUS;
export type DeliveryMode = [keyof typeof DELIVERY_OPTIONS][number];
export type DeliveryDays = [keyof typeof DAYS][number];
