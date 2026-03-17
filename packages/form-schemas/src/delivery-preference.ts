import { DAYS, DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryDays } from '@lactalink/types';
import { z } from 'zod';
import { addressSchema } from './address';
import { emptyTransform, nullTransform } from './transformers';

export const deliveryPreferenceSchema = z.object(
  {
    id: z.uuid('ID is required.').nonempty('ID is required.'),
    name: z.string().transform(emptyTransform).optional().nullable(),
    address: z.object(addressSchema.shape, 'Address is required.'),
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
  },
  'Delivery Preference is required.'
);

export const deliveryPreferencesSchema = z.object({
  deliveryPreferences: z
    .array(deliveryPreferenceSchema)
    .min(1, 'Atleast one delivery preference is required.'),
});

export const createDeliveryPreferenceSchema = deliveryPreferenceSchema.omit({ id: true });

export const deliverySchema = z
  .object(
    {
      mode: z.enum(
        Object.values(DELIVERY_OPTIONS).map((item) => item.value),
        'Select one option'
      ),
      date: z.string('Date is required.').nonempty('Date is required.'),
      time: z.string('Time is required.').nonempty('Time is required.'),
      address: z.object(addressSchema.shape, 'Address is required.'),
      note: z.string().transform(nullTransform).optional().nullable(),
      deliveryPreference: deliveryPreferenceSchema.optional().nullable(),
    },
    'Delivery details are required.'
  )
  .refine(
    (data) => {
      const preference = data.deliveryPreference;
      if (!preference) return true;

      const preferredDays = preference.availableDays;
      const deliveryDate = new Date(data.date);
      const deliveryDay = deliveryDate
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toUpperCase();

      return preferredDays.includes(deliveryDay as DeliveryDays);
    },
    {
      path: ['date'],
      error: 'Date does not match with the preferred days from the selected delivery preference.',
    }
  );

export const deliveryCreateSchema = z.object(
  {
    type: z.enum(['PROPOSED', 'CONFIRMED'], 'Select one option'),
    ...deliverySchema.shape,
  },
  'Delivery details are required.'
);

export type DeliveryPreferenceSchema = z.infer<typeof deliveryPreferenceSchema>;
export type DeliveryPreferencesSchema = z.infer<typeof deliveryPreferencesSchema>;
export type DeliveryPreferenceCreateSchema = z.infer<typeof createDeliveryPreferenceSchema>;
export type DeliverySchema = z.infer<typeof deliverySchema>;
export type DeliveryCreateSchema = z.infer<typeof deliveryCreateSchema>;
