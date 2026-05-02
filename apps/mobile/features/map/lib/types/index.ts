import { BoundarySchema } from '@lactalink/form-schemas/geocoding';
import { MarkerType } from '@lactalink/types';
import { MapMarker } from '@lactalink/types/api';
import { DataMarkerSlug } from './marker';

export * from './marker';

export type { BoundarySchema, MapMarker, MarkerType };

export type MapQueryParams = {
  /**
   * Marker ID in the format of `slug-id-[longitude,latitude]`, where:
   * - `slug` is the collection slug (e.g., 'donations', 'requests', etc.)
   * - `id` is the unique identifier of the item in the collection
   * - `longitude` and `latitude` are the coordinates of the marker
   * Example: `donations-12345-[37.7749,-122.4194]`
   */
  mrk?: string;

  /**
   * List type for the Explore screen, can be used to pre-filter the listings.
   * Expected values are the collection slugs (e.g., 'donations', 'requests', etc.)
   * Example: `donations`
   */
  list?: DataMarkerSlug;

  /**
   * Optional latitude parameter for directly setting the map camera position.
   * These can be used in conjunction with the `mrk` parameter or independently.
   * Example: `lat=37.7749&lng=-122.4194`
   */
  lat?: string;

  /**
   * Optional longitude parameter for directly setting the map camera position.
   * These can be used in conjunction with the `mrk` parameter or independently.
   * Example: `lat=37.7749&lng=-122.4194`
   */
  lng?: string;

  /**
   * Starting point for directions, expected in the format of `[<latitude>,<longitude>]`.
   */
  start?: string;

  /**
   * Destination point for directions, expected in the format of `[<latitude>,<longitude>]`.
   */
  dest?: string;

  /**
   * Optional address ID that can be used to link a map marker to a specific address.
   */
  addrID?: string;
};

export type MapListingSlug = DataMarkerSlug;
