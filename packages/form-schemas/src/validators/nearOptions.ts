import { pointSchema } from '@/geocoding';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { z } from 'zod';

const statusValues = Object.values(DONATION_REQUEST_STATUS).map((item) => item.value);

export const nearListingsOptionsSchema = z.object({
  location: pointSchema,
  maxDistance: z.coerce
    .number('Max distance must be a valid number.')
    .positive('Max distance must be a positive number')
    .optional(),
  status: z
    .enum(statusValues, `Status must be one of the predefined values: [${statusValues.join(', ')}]`)
    .optional(),
});

export const nearOrganizationsOptionsSchema = z.object({
  ...nearListingsOptionsSchema.omit({ status: true }).shape,
  search: z.coerce.string().nullish(),
});

/**
 * @deprecated Use {@link nearListingsOptionsSchema} instead, which is more appropriately named for its intended
 * use with both donations and requests. This schema will be removed in a future release.
 */
export const nearDonationRequestSchema = z.object({
  location: pointSchema,
  maxDistance: z.coerce
    .number('Max distance must be a valid number.')
    .positive('Max distance must be a positive number')
    .optional(),
  status: z
    .enum(statusValues, `Status must be one of the predefined values: [${statusValues.join(', ')}]`)
    .optional(),
});

export type NearListingsOptions = z.infer<typeof nearListingsOptionsSchema>;

export type NearOrganizationsOptions = z.infer<typeof nearOrganizationsOptionsSchema>;

/**
 * @deprecated Use {@link NearListingsOptions} instead, which is more appropriately named for its intended
 */
export type NearDonationOrRequestOptions = z.infer<typeof nearDonationRequestSchema>;
