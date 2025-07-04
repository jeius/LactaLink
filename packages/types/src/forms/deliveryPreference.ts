import { z } from 'zod/v4';
import { DAYS, DELIVERY_OPTIONS } from '../enums';

export const deliveryPreferenceSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().optional().nullable(),
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
