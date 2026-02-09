import { addressGeocodingSchema } from '@/geocoding';
import { emptyTransform, nullTransform } from '@/transformers';
import * as z from 'zod';

export const addressSchema = z.object({
  id: z.uuid().nonempty('Required'),
  name: z.string().transform(emptyTransform).optional(),
  street: z.string().transform(nullTransform).optional().nullable(),
  province: z.string().nonempty('Required.'),
  cityMunicipality: z.string().nonempty('Required.'),
  barangay: z.string().transform(nullTransform).optional().nullable(),
  zipCode: z.string().nonempty('Required.'),
  isDefault: z.boolean(),
  displayName: z.string().transform(emptyTransform).optional().nullable(),
  ...addressGeocodingSchema.shape,
});

export const addressCreateSchema = addressSchema.omit({ id: true, displayName: true });

export type AddressSchema = z.infer<typeof addressSchema>;
export type AddressCreateSchema = z.infer<typeof addressCreateSchema>;
export { type CoordinatesSchema } from '@/geocoding';
