import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { z } from 'zod';
import { pointSchema } from './pointSchema';

const statusValues = Object.values(DONATION_REQUEST_STATUS).map((item) => item.value);

export const nearDonationRequestSchema = z.object({
  location: pointSchema,
  maxDistance: z
    .number('Max distance must be a valid number.')
    .positive('Max distance must be a positive number')
    .optional(),
  status: z
    .enum(statusValues, `Status must be one of the predefined values: [${statusValues.join(', ')}]`)
    .optional(),
});

export type NearDonationRequestSchema = z.infer<typeof nearDonationRequestSchema>;
