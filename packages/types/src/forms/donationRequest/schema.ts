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
  volume: z.number('Required').min(20, 'Atleast 20mL').positive(),
  collectedAt: z.iso.datetime('Required'),
  quantity: z.number('Required').min(1, 'Atleast 1 bag').positive(),
});

export const donationDetailsSchema = z.object({
  storageType: z.enum(
    Object.values(STORAGE_TYPES).map((item) => item.value),
    'Select one option'
  ),
  collectionMode: z.enum(
    Object.values(COLLECTION_MODES).map((item) => item.value),
    'Select one option'
  ),
  bags: z.array(milkBagSchema).min(1, 'Required at least one milk bag.'),
  milkSample: z.array(imageSchema).optional().nullable(),
  notes: textAreaSchema.describe('Additional Notes'),
});

export const requestDetailsSchema = z.object({
  neededAt: z.iso.datetime(),
  storagePreference: z.enum([...Object.values(STORAGE_TYPES).map((item) => item.value), 'EITHER']),
  urgency: z.enum(Object.values(PRIORITY_LEVELS).map((item) => item.value)),
  image: imageSchema.optional().nullable(),
  notes: textAreaSchema,
  reason: textAreaSchema,
});

export const deliverySchema = z.object({
  id: z.uuid().optional().nullable(),
  address: z.uuid().nonempty('Required'),
  preferredMode: z
    .array(
      z.enum(
        Object.values(DELIVERY_OPTIONS).map((item) => item.value),
        'Select one option'
      )
    )
    .min(1, 'Atleast one delivery mode is selected.'),
  availableDays: z
    .array(z.enum(Object.values(DAYS).map((item) => item.value)))
    .min(1, 'Atleast one day is selected.'),
});

export const deliveryDetailsSchema = z.object({
  deliveryDetails: z.array(deliverySchema).min(1, 'Atleast one delivery detail is required.'),
});

export const createDonationSchema = z
  .object({
    donor: z.uuid().nonempty('Required'),
    recipient: z.uuid().optional().nullable(),
    details: donationDetailsSchema,
  })
  .and(deliveryDetailsSchema);

export const createRequestSchema = z
  .object({
    requester: z.uuid().nonempty('Required'),
    requestedDonor: z.uuid().optional().nullable(),
    volumeNeeded: z.number('Required').min(20, 'Atleast 20mL').positive(),
    details: requestDetailsSchema,
  })
  .and(deliveryDetailsSchema);
