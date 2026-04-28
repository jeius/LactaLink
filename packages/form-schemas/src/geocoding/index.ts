import { nullTransform } from '@/transformers';
import { GEOCODE_SOURCES } from '@lactalink/enums/geocoding';
import z from 'zod';

const latitudeSchema = z.coerce
  .number('Latitude must be a valid number')
  .min(-90, { message: 'Latitude must be between -90 and 90' })
  .max(90, { message: 'Latitude must be between -90 and 90' });

const longitudeSchema = z.coerce
  .number('Longitude must be a valid number')
  .min(-180, { message: 'Longitude must be between -180 and 180' })
  .max(180, { message: 'Longitude must be between -180 and 180' });

export const coordinatesSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});

export const boundarySchema = z.object({
  swLat: latitudeSchema,
  swLng: longitudeSchema,
  neLat: latitudeSchema,
  neLng: longitudeSchema,
});

export const addressGeocodingSchema = z.object({
  geocodedAddress: z.string().transform(nullTransform).optional().nullable(),
  geocodedComponents: z.any().optional().nullable(),
  geocodedAt: z.date().optional().nullable(),
  coordinates: coordinatesSchema,
  geocodeSource: z
    .enum(Object.values(GEOCODE_SOURCES).map(({ value }) => value))
    .optional()
    .nullable(),
});

export type AddressGeocoding = z.infer<typeof addressGeocodingSchema>;
export type CoordinatesSchema = z.infer<typeof coordinatesSchema>;
export type BoundarySchema = z.infer<typeof boundarySchema>;
