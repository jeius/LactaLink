import { CreateDonationSchema, CreateRequestSchema } from '@lactalink/types';
import { FieldPath } from 'react-hook-form';
import { DonationRequestSteps } from '../types/donationRequest';

export const DONATION_REQUEST_STEPS: DonationRequestSteps[] = ['details', 'deliveryDetails'];

export const DONATION_DETAILS_FIELDS: FieldPath<CreateDonationSchema>[] = [
  'details.bags',
  'details.collectionMode',
  'details.milkSample',
  'details.notes',
  'details.storageType',
];

export const REQUEST_DETAILS_FIELDS: FieldPath<CreateRequestSchema>[] = [
  'details.image',
  'details.notes',
  'details.storagePreference',
  'details.reason',
  'details.urgency',
];
