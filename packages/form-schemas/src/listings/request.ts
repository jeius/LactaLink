import * as z from 'zod';

import { PREFERRED_STORAGE_TYPES, STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';

import { deliveryCreateSchema, deliveryPreferencesSchema } from '../delivery-preference';
import { imageSchema } from '../file';
import { milkBagSchema } from '../milk-bag';
import { textAreaSchema } from '../textarea';
import { recipientSchema } from './recipient';

const matchedDonationSchema = z.object({
  id: z.uuid().nonempty('Required'),
  donor: z.uuid().nonempty('Required'),
  storageType: z.enum(
    Object.values(STORAGE_TYPES).map((item) => item.value),
    'Select one option'
  ),
  bags: z.array(milkBagSchema).min(1, 'Required at least one milk bag.'),
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
  bags: z.array(milkBagSchema).optional(),
  image: imageSchema.optional().nullable(),
  notes: textAreaSchema,
  reason: textAreaSchema,
});

export const requestSchema = z.object({
  id: z.uuid('Invalid UUID').nonempty('Required'),
  requester: z.uuid('Invalid UUID').nonempty('Required'),
  volumeNeeded: z.number('Required').min(20, 'Atleast 20mL').positive(),
  details: requestDetailsSchema,
  ...deliveryPreferencesSchema.shape,
});

export const requestCreateSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('MATCHED'),
      matchedDonation: matchedDonationSchema,
      delivery: deliveryCreateSchema,
      ...requestSchema.omit({ id: true, details: true }).shape,
      details: requestDetailsSchema.required({ bags: true }),
    }),
    z.object({
      type: z.literal('OPEN'),
      ...requestSchema.omit({ id: true }).shape,
    }),
    z.object({
      type: z.literal('DIRECT'),
      recipient: recipientSchema,
      ...requestSchema.omit({ id: true }).shape,
    }),
  ])
  .refine(
    (data) => {
      if (data.type !== 'MATCHED') return true;
      return (data.details.bags?.length || 0) > 0;
    },
    {
      error: 'You must select at least one milk bag.',
      path: ['details', 'bags'],
    }
  );

export const requestUpdateSchema = requestSchema.pick({
  id: true,
  details: true,
  volumeNeeded: true,
  deliveryPreferences: true,
});
