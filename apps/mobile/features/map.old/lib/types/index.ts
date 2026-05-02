import { Coordinates, ImageData, UserProfile } from '@lactalink/types';
import { CollectionSlug } from '@lactalink/types/payload-types';

export * from './marker';

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
  list?: string;

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

export type MapListingSlug = Extract<
  CollectionSlug,
  'donations' | 'requests' | 'hospitals' | 'milkBanks'
>;

export type MapListingItem = {
  /**
   * The slug of the listing, which corresponds to the collection it belongs to (e.g.,
   * 'donations', 'requests', etc.). This is used to determine the type of the listing
   * and how it should be displayed in the UI.
   */
  slug: MapListingSlug;
  /**
   * Main title or name of the listing item, used for display purposes in the listing carousel.
   */
  title: string;
  /**
   * For donations and requests, this would be the user who created the listing.
   */
  user?: UserProfile;
  /**
   * Distance in kilometers from the user's current location, used for sorting and display purposes.
   * Optional because it may not always be available depending on the data source.
   */
  distance?: number | null | undefined;
  /**
   * `ImageData` object containing the URL and metadata of the listing's image.
   * Optional because some listings may not have an associated image.
   */
  image?: ImageData | null | undefined;
  /**
   * Coordinates of the listing item, used for placing markers on the map and for calculating distances.
   * This is required for map functionality, but may be null or undefined if the data source does not provide it.
   */
  coordinates: Coordinates;
  /**
   * Unique identifier for the listing item, used for navigation and linking to the specific marker on the map.
   * This is required for linking the listing item to its corresponding marker on the map.
   */
  markerID: string;
};
