import { DAYS, DELIVERY_OPTIONS } from '@lactalink/enums';
import { z } from 'zod';
import { nullTransform } from './transformers';

export const deliveryPreferenceSchema = z.object({
  id: z.uuid('ID is required.').nonempty('ID is required.'),
  name: z.string().transform(nullTransform).optional().nullable(),
  address: z.uuid('Address is required.').nonempty('Address is required.'),
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

export const createDeliveryPreferenceSchema = deliveryPreferenceSchema.omit({ id: true });

export type DeliveryPreferenceSchema = z.infer<typeof deliveryPreferenceSchema>;
export type CreateDeliveryPreferenceSchema = z.infer<typeof createDeliveryPreferenceSchema>;
