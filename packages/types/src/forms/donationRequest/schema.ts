import { z } from 'zod/v4';

import {
  COLLECTION_MODES,
  DAYS,
  DELIVERY_OPTIONS,
  PRIORITY_LEVELS,
  STORAGE_TYPES,
} from '../../enums';

import { imageSchema } from '../file';
import { emptyTransform } from '../transformers';

export const textAreaSchema = z
  .string()
  .max(500, 'Max length 500 characters')
  .transform(emptyTransform)
  .optional();

export const milkBagSchema = z.object({
  donor: z.uuid().nonempty('Required'),
  volume: z.number().min(20, 'Atleast 20mL of milk is specified.').positive().default(20),
  collectedAt: z.iso.datetime().default(() => new Date().toISOString()),
  quantity: z.number().min(1, 'Atleast 1 milk bag is specified.').positive().default(1),
});

export const donationDetailsSchema = z.object({
  storageType: z.enum(Object.values(STORAGE_TYPES).map((item) => item.value)),
  collectionMode: z.enum(Object.values(COLLECTION_MODES).map((item) => item.value)),
  bags: z.array(milkBagSchema).min(1, 'Required at least one milk bag.'),
  milkSample: z.array(imageSchema).optional().nullable(),
  notes: textAreaSchema.describe('Additional Notes'),
});

export const requestDetailsSchema = z.object({
  neededAt: z.iso.datetime().default(() => new Date().toISOString()),
  storagePreference: z
    .enum([...Object.values(STORAGE_TYPES).map((item) => item.value), 'EITHER'])
    .default('EITHER'),
  urgency: z.enum(Object.values(PRIORITY_LEVELS).map((item) => item.value)).default('MEDIUM'),
  bags: z.array(milkBagSchema).optional().nullable(),
  image: imageSchema.optional().nullable(),
  notes: textAreaSchema,
  reason: textAreaSchema,
});

export const deliverySchema = z.object({
  prefferedModes: z
    .array(z.enum(Object.values(DELIVERY_OPTIONS).map((item) => item.value)))
    .min(1, 'Atleast one delivery mode is selected.')
    .default(Object.values(DELIVERY_OPTIONS).map((item) => item.value)),
  address: z.uuid().nonempty('Required'),
  availableDays: z
    .array(z.enum(Object.values(DAYS).map((item) => item.value)))
    .min(1, 'Atleast one day is selected.')
    .default(Object.values(DAYS).map((item) => item.value)),
});

export const createDonationSchema = z.object({
  donor: z.uuid().nonempty('Required'),
  recipient: z.uuid().optional().nullable(),
  details: donationDetailsSchema,
  deliveryDetails: z.array(deliverySchema),
});

export const createRequestSchema = z.object({
  requester: z.uuid().nonempty('Required'),
  requestedDonor: z.uuid().optional().nullable(),
  details: requestDetailsSchema,
  deliveryDetails: deliverySchema,
});
