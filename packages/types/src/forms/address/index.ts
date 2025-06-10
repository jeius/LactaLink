import { z } from 'zod/v4';
import { emptyTransform, nullTransform } from '../transformers';

export const addressSchema = z.object({
  name: z.string().transform(emptyTransform).optional(),
  street: z.string().transform(nullTransform).optional().nullable(),
  province: z.string().nonempty('Required.'),
  cityMunicipality: z.string().nonempty('Required.'),
  barangay: z.string().transform(nullTransform).optional().nullable(),
  zipCode: z.string().nonempty('Required.'),
  default: z.boolean().optional(),
});

export type AddressSchema = z.infer<typeof addressSchema>;
