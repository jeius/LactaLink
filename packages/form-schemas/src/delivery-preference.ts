import { DAYS, DELIVERY_OPTIONS } from '@lactalink/enums';
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

export const createDeliveryPreferenceSchema = deliveryPreferenceSchema.omit({ id: true });

export const deliverySchema = z.object(
  {
    mode: z.enum(
      Object.values(DELIVERY_OPTIONS).map((item) => item.value),
      'Select one option'
    ),
    dateTime: z.string('Date is required.').nonempty('Date is required.'),
    address: addressSchema,
    note: z.string().transform(nullTransform).optional().nullable(),
  },
  'Delivery details are required.'
);

export const deliveryCreateSchema = z.object({
  type: z.enum(['PROPOSED', 'CONFIRMED'], 'Select one option'),
  ...deliverySchema.shape,
});

export type DeliveryPreferenceSchema = z.infer<typeof deliveryPreferenceSchema>;
export type DeliveryPreferenceCreateSchema = z.infer<typeof createDeliveryPreferenceSchema>;
export type DeliverySchema = z.infer<typeof deliverySchema>;
export type DeliveryCreateSchema = z.infer<typeof deliveryCreateSchema>;
