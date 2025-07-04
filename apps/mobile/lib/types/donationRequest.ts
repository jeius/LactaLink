import { CollectionSlug, DonationSchema, RequestSchema } from '@lactalink/types';
import { FieldPath } from 'react-hook-form';

export type DonationRequestSteps =
  | keyof Pick<DonationSchema | RequestSchema, 'details' | 'deliveryDetails'>
  | 'review';

export type DonationRequestFields = Record<
  Exclude<DonationRequestSteps, 'review'>,
  FieldPath<DonationSchema | RequestSchema>[]
>;

export type DonationRequestSlug = Extract<CollectionSlug, 'donations' | 'requests'>;

export type CreateDonationRequestParams = {
  step: DonationRequestSteps;
} & (
  | { slug: Extract<CollectionSlug, 'donations'>; recipientId?: string }
  | { slug: Extract<CollectionSlug, 'requests'>; requestedDonorId?: string }
);
