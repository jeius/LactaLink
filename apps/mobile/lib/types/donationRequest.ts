import { CollectionSlug, DonationSchema, RequestSchema } from '@lactalink/types';
import { FieldPath } from 'react-hook-form';

export type DonationRequestSteps =
  | keyof Pick<DonationSchema | RequestSchema, 'details' | 'deliveryPreferences'>
  | 'review';

export type DonationRequestFields = Record<
  Exclude<DonationRequestSteps, 'review'>,
  FieldPath<DonationSchema | RequestSchema>[]
>;

export type DonationRequestSlug = Extract<CollectionSlug, 'donations' | 'requests'>;

export type DonationRequestParams = {
  step: DonationRequestSteps;
} & (
  | { slug: Extract<CollectionSlug, 'donations'>; matchedRequest?: string }
  | {
      slug: Extract<CollectionSlug, 'requests'>;
      requestedDonorId?: string;
      matchedDonation?: string;
    }
);

export type DonationCreateSearchParams = {
  matchedRequest?: string;
};

export type RequestSearchParams = {
  requestedDonorId?: string;
  matchedDonation?: string;
};
