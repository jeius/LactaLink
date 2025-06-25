import { CreateDonationSchema, CreateRequestSchema } from '@lactalink/types';
import { FieldPath } from 'react-hook-form';

export type DonationRequestSteps = keyof Pick<
  CreateDonationSchema | CreateRequestSchema,
  'details' | 'deliveryDetails'
>;
export type DonationFields = Record<DonationRequestSteps, FieldPath<CreateDonationSchema>[]>;
export type DonationStepsParams = { step: DonationRequestSteps; recipientId?: string };
