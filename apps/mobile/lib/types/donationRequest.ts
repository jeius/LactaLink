import { CreateDonationSchema } from '@lactalink/types';
import { FieldPath } from 'react-hook-form';

export type DonationSteps = keyof Pick<CreateDonationSchema, 'details' | 'deliveryDetails'>;
export type DonationFields = Record<DonationSteps, FieldPath<CreateDonationSchema>[]>;
export type DonationStepsParams = { step: DonationSteps; recipientId?: string };
