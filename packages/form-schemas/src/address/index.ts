import * as z from 'zod';
import { emptyTransform, nullTransform } from '../transformers';

export const coordinatesSchema = z.object({
  latitude: z
    .number('Latitude must be a valid number')
    .min(-90, { message: 'Latitude must be between -90 and 90' })
    .max(90, { message: 'Latitude must be between -90 and 90' }),
  longitude: z
    .number('Longitude must be a valid number')
    .min(-180, { message: 'Longitude must be between -180 and 180' })
    .max(180, { message: 'Longitude must be between -180 and 180' }),
});

export const addressSchema = z.object({
  id: z.uuid().nonempty('Required'),
  name: z.string().transform(emptyTransform).optional(),
  street: z.string().transform(nullTransform).optional().nullable(),
  province: z.string().nonempty('Required.'),
  cityMunicipality: z.string().nonempty('Required.'),
  barangay: z.string().transform(nullTransform).optional().nullable(),
  zipCode: z.string().nonempty('Required.'),
  coordinates: coordinatesSchema,
  isDefault: z.boolean(),
  displayName: z.string().transform(emptyTransform).optional().nullable(),
});

export const addressCreateSchema = addressSchema.omit({ id: true, displayName: true });

export type AddressSchema = z.infer<typeof addressSchema>;
export type AddressCreateSchema = z.infer<typeof addressCreateSchema>;
export type CoordinatesSchema = z.infer<typeof coordinatesSchema>;
