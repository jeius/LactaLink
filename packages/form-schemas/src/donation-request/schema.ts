import * as z from 'zod';

import {
  COLLECTION_MODES,
  PREFERRED_STORAGE_TYPES,
  STORAGE_TYPES,
  URGENCY_LEVELS,
} from '@lactalink/enums';

import { DeliveryDays } from '@lactalink/types';
import { User } from '@lactalink/types/payload-generated-types';
import { deliveryCreateSchema, deliveryPreferenceSchema } from '../delivery-preference';
import { imageSchema } from '../file';
import { createMilkBagSchema, milkBagSchema } from '../milk-bag';
import { textAreaSchema } from '../textarea';

const recipientSchema = z.object({
  relationTo: z.custom<NonNullable<User['profile']>['relationTo']>(),
  value: z.uuid().nonempty('Required'),
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
  bags: z.array(createMilkBagSchema).min(1, 'Required at least one milk bag.'),
  image: imageSchema.optional().nullable(),
  notes: textAreaSchema,
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
  bags: z.array(milkBagSchema).optional().nullable(),
  image: imageSchema.optional().nullable(),
  notes: textAreaSchema,
  reason: textAreaSchema,
});

export const deliveryPreferencesSchema = z.object({
  deliveryPreferences: z
    .array(deliveryPreferenceSchema)
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

export const matchedDonationSchema = z.object({
  id: z.uuid().nonempty('Required'),
  donor: z.uuid().nonempty('Required'),
  storageType: z.enum(
    Object.values(STORAGE_TYPES).map((item) => item.value),
    'Select one option'
  ),
  bags: z.array(milkBagSchema).min(1, 'Required at least one milk bag.'),
});

export const donationSchema = z.object({
  id: z.uuid('Invalid UUID').nonempty('Required'),
  donor: z.uuid('Invalid UUID').nonempty('Required'),
  details: donationDetailsSchema,
  milkBags: z.array(milkBagSchema),
  ...deliveryPreferencesSchema.shape,
});

export const requestSchema = z.object({
  id: z.uuid('Invalid UUID').nonempty('Required'),
  requester: z.uuid('Invalid UUID').nonempty('Required'),
  recipient: recipientSchema.optional().nullable(),
  volumeNeeded: z.number('Required').min(20, 'Atleast 20mL').positive(),
  details: requestDetailsSchema,
  ...deliveryPreferencesSchema.shape,
});

export const donationCreateSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('MATCHED'),
      matchedRequest: requestSchema,
      delivery: deliveryCreateSchema,
      ...donationSchema.omit({ id: true }).shape,
    }),
    z.object({
      type: z.literal('OPEN'),
      ...donationSchema.omit({ id: true }).shape,
    }),
    z.object({
      type: z.literal('DIRECT'),
      recipient: recipientSchema,
      ...donationSchema.omit({ id: true }).shape,
    }),
  ])
  .refine(
    (data) => {
      if (data.type === 'MATCHED' && data.matchedRequest.details.storagePreference !== 'EITHER') {
        return data.details.storageType === data.matchedRequest.details.storagePreference;
      }
      return true;
    },
    {
      error: 'Does not match the requested type',
      path: ['details', 'storageType'],
    }
  )
  .refine(
    (data) => {
      if (data.milkBags.some((bag) => !bag.bagImage)) {
        return false;
      }

      return true;
    },
    {
      error: 'Not all milk bags have been verified.',
      path: ['milkBags'],
    }
  )
  .refine(
    (data) => {
      if (data.type === 'MATCHED' && data.matchedRequest) {
        const preference = data.deliveryPreferences[0];
        if (!preference) return false;

        const preferredDays = preference.availableDays;
        const deliveryDate = new Date(data.delivery.dateTime);
        const deliveryDay = deliveryDate
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toUpperCase();
        if (!preferredDays.includes(deliveryDay as DeliveryDays)) {
          return false;
        }
      }
      return true;
    },
    {
      path: ['delivery', 'dateTime'],
      error: 'Selected date does not match with the preferred days.',
    }
  );

export const requestCreateSchema = z
  .discriminatedUnion('matchedDonation', [
    z.object({
      matchedDonation: donationSchema,
      delivery: deliveryCreateSchema,
      ...requestSchema.omit({ id: true }).shape,
    }),
    z.object({
      matchedDonation: z.literal(null).optional(),
      ...requestSchema.omit({ id: true }).shape,
    }),
  ])
  .refine(
    (data) => {
      if (data.matchedDonation) {
        if (!data.details.bags || data.details.bags.length === 0) {
          return false;
        }
      }

      return true;
    },
    {
      error: 'You must select at least one milk bag.',
      path: ['details', 'bags'],
    }
  );

export const donationUpdateSchema = z.object({
  details: donationDetailsSchema.omit({ bags: true }),
  ...donationSchema.pick({ id: true, deliveryPreferences: true }).shape,
});

export const requestUpdateSchema = requestSchema.pick({
  id: true,
  details: true,
  recipient: true,
  volumeNeeded: true,
  deliveryPreferences: true,
});
