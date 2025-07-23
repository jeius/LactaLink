import * as z from 'zod/v4';

import {
  COLLECTION_MODES,
  PREFERRED_STORAGE_TYPES,
  STORAGE_TYPES,
  URGENCY_LEVELS,
} from '@lactalink/enums';

import { imageSchema } from '../file';
import { textAreaSchema } from '../textarea';

export const milkBagSchema = z.object({
  id: z.uuid().optional(),
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
  neededAt: z.iso.datetime('Required'),
  storagePreference: z.enum(
    Object.values(PREFERRED_STORAGE_TYPES).map((item) => item.value),
    'Select one option'
  ),
  urgency: z.enum(
    Object.values(URGENCY_LEVELS).map((item) => item.value),
    'Select one option'
  ),
  bags: z.array(z.uuid().nonempty('Required')).optional().nullable(),
  image: imageSchema.optional().nullable(),
  notes: textAreaSchema,
  reason: textAreaSchema,
});

export const deliveryPreferencesSchema = z.object({
  deliveryPreferences: z
    .array(z.uuid().nonempty('Required'))
    .min(1, 'Atleast one delivery preference is required.'),
});

export const matchedRequestSchema = z.object({
  id: z.uuid().nonempty('Required'),
  requester: z.uuid().nonempty('Required'),
  volumeNeeded: z.number('Required').min(20, 'Atleast 20mL').positive(),
  storagePreference: z.enum(
    Object.values(PREFERRED_STORAGE_TYPES).map((item) => item.value),
    'Required one option'
  ),
});

export const donationSchema = z
  .object({
    id: z.uuid().optional(),
    donor: z.uuid().nonempty('Required'),
    matchedRequest: matchedRequestSchema.optional(),
    details: donationDetailsSchema,
  })
  .and(deliveryPreferencesSchema)
  .refine(
    (data) => {
      if (!data.matchedRequest) {
        return true;
      }
      if (data.matchedRequest.storagePreference !== 'EITHER') {
        return data.details.storageType === data.matchedRequest.storagePreference;
      }
      return true;
    },
    {
      message: 'Does not match the requested type',
      path: ['details', 'storageType'],
    }
  )
  .refine(
    (data) => {
      if (data.matchedRequest?.volumeNeeded) {
        const totalVolume = data.details.bags.reduce(
          (sum, bag) => sum + bag.volume * bag.quantity,
          0
        );
        return totalVolume >= data.matchedRequest.volumeNeeded;
      }
      return true;
    },
    {
      message: 'Insufficient total milk volume',
      path: ['details', 'bags'],
    }
  );

export const matchedDonationSchema = z.object({
  id: z.uuid().nonempty('Required'),
  donor: z.uuid().nonempty('Required'),
  storageType: z.enum(
    Object.values(STORAGE_TYPES).map((item) => item.value),
    'Select one option'
  ),
  bags: z.array(z.uuid().nonempty('Required')).min(1, 'Required at least one milk bag.'),
});

export const requestSchema = z
  .object({
    id: z.uuid().optional(),
    requester: z.uuid().nonempty('Required'),
    requestedDonor: z.uuid().optional().nullable(),
    volumeNeeded: z.number('Required').min(20, 'Atleast 20mL').positive(),
    details: requestDetailsSchema,
    matchedDonation: matchedDonationSchema.optional(),
  })
  .and(deliveryPreferencesSchema);
