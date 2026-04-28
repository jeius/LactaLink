import { boundarySchema } from '@/geocoding';
import { MarkerType } from '@lactalink/types';
import { z } from 'zod';

export const MARKER_TYPES: MarkerType[] = ['donations', 'requests', 'hospitals', 'milkBanks'];

export const markerTypeEnum = z.enum(MARKER_TYPES);

/**
 * Validates and parses GET query parameters for the map markers endpoint.
 */
export const mapMarkersQuerySchema = z.object({
  ...boundarySchema.shape,
  types: z.array(markerTypeEnum).min(1).optional(),
});

export type MapMarkersQueryOptions = z.infer<typeof mapMarkersQuerySchema>;
