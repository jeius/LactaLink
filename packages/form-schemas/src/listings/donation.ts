import { z } from 'zod';

import { COLLECTION_MODES, PREFERRED_STORAGE_TYPES, STORAGE_TYPES } from '@lactalink/enums';

import { deliveryCreateSchema, deliveryPreferenceSchema } from '@/delivery-preference';
import { imageSchema } from '@/file';
import { milkBagSchema } from '@/milk-bag';
import { textAreaSchema } from '@/textarea';
import { recipientSchema } from './recipient';

const matchedRequestSchema = z.object({
  id: z.uuid().nonempty('Required'),
  requester: z.uuid().nonempty('Required'),
  volumeNeeded: z.number('Required').min(20, 'Atleast 20mL').positive(),
  storagePreference: z.enum(
    Object.values(PREFERRED_STORAGE_TYPES).map((item) => item.value),
    'Required one option'
  ),
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
  image: imageSchema.optional().nullable(),
  notes: textAreaSchema,
});

export const donationSchema = z.object({
  id: z.uuid('Invalid UUID').nonempty('Required'),
  donor: z.uuid('Invalid UUID').nonempty('Required'),
  details: donationDetailsSchema,
  deliveryPreferences: z.array(deliveryPreferenceSchema).nullish(),
});

export const donationCreateSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('MATCHED'),
      matchedRequest: matchedRequestSchema,
      delivery: deliveryCreateSchema,
      ...donationSchema.omit({ id: true }).shape,
    }),
    z.object({
      type: z.literal('DIRECT'),
      recipient: recipientSchema,
      ...donationSchema.omit({ id: true }).shape,
    }),
    z.object({
      type: z.literal('OPEN'),
      ...donationSchema.omit({ id: true, deliveryPreferences: true }).shape,
      deliveryPreferences: z
        .array(deliveryPreferenceSchema)
        .min(1, 'Required at least one delivery preference.'),
    }),
  ])
  .refine(
    (data) => {
      if (data.type !== 'MATCHED') return true;
      const preferredStorage = data.matchedRequest.storagePreference;
      const storageType = data.details.storageType;
      if (preferredStorage === 'EITHER') return true;
      return storageType === preferredStorage;
    },
    {
      error: 'Does not match the requested storage.',
      path: ['details', 'storageType'],
    }
  );

export const donationUpdateSchema = donationSchema.pick({
  id: true,
  details: true,
  deliveryPreferences: true,
});
