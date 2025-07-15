import * as z from 'zod/v4';
import { emptyTransform, nullTransform } from '../transformers';

export const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const addressSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().transform(emptyTransform).optional(),
  street: z.string().transform(nullTransform).optional().nullable(),
  province: z.string().nonempty('Required.'),
  cityMunicipality: z.string().nonempty('Required.'),
  barangay: z.string().transform(nullTransform).optional().nullable(),
  zipCode: z.string().nonempty('Required.'),
  coordinates: coordinatesSchema.optional(),
  default: z.boolean().optional(),
});

export type AddressSchema = z.infer<typeof addressSchema>;
export type CoordinatesSchema = z.infer<typeof coordinatesSchema>;
