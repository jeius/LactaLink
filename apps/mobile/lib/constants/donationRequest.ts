import { CreateDonationSchema } from '@lactalink/types';
import { FieldPath } from 'react-hook-form';
import { DonationSteps } from '../types/donationRequest';

export const DONATION_STEPS: DonationSteps[] = ['details', 'deliveryDetails'];

export const DONATION_DETAILS_FIELDS: FieldPath<CreateDonationSchema>[] = [
  'details.bags',
  'details.collectionMode',
  'details.milkSample',
  'details.notes',
  'details.storageType',
];
