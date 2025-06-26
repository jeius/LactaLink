import { CollectionSlug, CreateDonationSchema, CreateRequestSchema } from '@lactalink/types';
import { FieldPath } from 'react-hook-form';

export type DonationRequestSteps = keyof Pick<
  CreateDonationSchema | CreateRequestSchema,
  'details' | 'deliveryDetails'
>;
export type DonationRequestFields = Record<
  DonationRequestSteps,
  FieldPath<CreateDonationSchema | CreateRequestSchema>[]
>;
export type DonationStepsParams = { step: DonationRequestSteps; recipientId?: string };
export type RequestStepsParams = { step: DonationRequestSteps; requestedDonorId?: string };

export type DonationRequestSlug = Extract<CollectionSlug, 'donations' | 'requests'>;
