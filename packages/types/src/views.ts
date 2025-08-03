import { DAYS, DELIVERY_OPTIONS, DONATION_REQUEST_STATUS } from '@lactalink/enums';

export type DonationRequestStatus = keyof typeof DONATION_REQUEST_STATUS;
export type DeliveryMode = [keyof typeof DELIVERY_OPTIONS][number];
export type DeliveryDays = [keyof typeof DAYS][number];

export interface MatchCriteria {
  status?: DonationRequestStatus;
  maxDistance?: number;
  matchBy?: ('deliveryMode' | 'deliveryDays' | 'barangay' | 'cityMunicipality' | 'province')[];
  nearestFirst?: boolean;
}
