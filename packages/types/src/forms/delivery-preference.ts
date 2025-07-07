import { DAYS, DELIVERY_OPTIONS } from '@lactalink/enums';
import * as z from 'zod/v4';
import { nullTransform } from './transformers';

export const deliveryPreferenceSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().transform(nullTransform).optional().nullable(),
  address: z.uuid().nonempty('Address is required.'),
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

export type DeliveryPreferenceSchema = z.infer<typeof deliveryPreferenceSchema>;
