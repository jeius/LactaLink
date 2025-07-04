import { DonationSchema, RequestSchema } from '@lactalink/types';
import { FieldPath } from 'react-hook-form';
import { DonationRequestSlug, DonationRequestSteps } from '../types/donationRequest';

export const DONATION_REQUEST_STEPS: DonationRequestSteps[] = [
  'details',
  'deliveryDetails',
  'review',
];

export const DONATION_DETAILS_FIELDS: FieldPath<DonationSchema>[] = [
  'details.bags',
  'details.collectionMode',
  'details.milkSample',
  'details.notes',
  'details.storageType',
];

export const REQUEST_DETAILS_FIELDS: FieldPath<RequestSchema>[] = [
  'details.image',
  'details.notes',
  'details.storagePreference',
  'details.reason',
  'details.urgency',
  'volumeNeeded',
];

export const DONATION_REQUEST_DETAILS: Record<
  DonationRequestSlug,
  FieldPath<RequestSchema | DonationSchema>[]
> = {
  donations: DONATION_DETAILS_FIELDS,
  requests: REQUEST_DETAILS_FIELDS,
};

export const VOLUME_PRESET = {
  20: { value: 20, label: '20 mL' },
  50: { value: 50, label: '50 mL' },
  100: { value: 100, label: '100 mL' },
  150: { value: 150, label: '150 mL' },
  300: { value: 300, label: '300 mL' },
  500: { value: 500, label: '500 mL' },
};
