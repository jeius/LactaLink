import { nullTransform } from '@/transformers';
import { GEOCODE_SOURCES } from '@lactalink/enums/geocoding';
import z from 'zod';

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

export const addressGeocodingSchema = z.object({
  geocodedAddress: z.string().transform(nullTransform).optional().nullable(),
  geocodedResults: z.any().optional().nullable(),
  geocodedAt: z.date().optional().nullable(),
  coordinates: coordinatesSchema,
  geocodeSource: z
    .enum(Object.values(GEOCODE_SOURCES).map(({ value }) => value))
    .optional()
    .nullable(),
});

export type AddressGeocoding = z.infer<typeof addressGeocodingSchema>;

export type CoordinatesSchema = z.infer<typeof coordinatesSchema>;
