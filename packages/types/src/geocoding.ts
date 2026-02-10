/**
 * Types for Google Geocoding and Places API responses
 */

import { Coordinates } from '@/geo-types';

/**
 * Address component from Google Geocoding API
 */
export interface GoogleAddressComponent {
  languageCode?: string | undefined;
  longText?: string | undefined;
  shortText?: string | undefined;
  types: string[] | undefined;
}

/**
 * Structured text result from Google API, used for autocomplete suggestions
 */
export interface GooglePlaceTextResult {
  matches?: { endOffset: number }[];
  text: string;
}

/**
 * Structured format for place suggestions from Google Places API
 */
export interface GooglePlaceStructuredFormat {
  mainText: GooglePlaceTextResult;
  secondaryText?: GooglePlaceTextResult;
}

export interface GooglePlaceAuthorAttribution {
  displayName?: string | undefined | null;
  photoUri?: string | undefined | null;
  uri: string | undefined | null;
}

export interface GooglePlacePhoto {
  name: string;
  flagContentUri: string;
  googleMapsUri: string;
  heightPx: number;
  widthPx: number;
  authorAttributions?: GooglePlaceAuthorAttribution[];
}

/**
 * Geometry information from Google Geocoding API
 */
export interface GooglePlaceDetails {
  addressComponents?: GoogleAddressComponent[];
  formattedAddress?: string;
  location?: Coordinates;
  viewport?: {
    high?: Coordinates;
    low?: Coordinates;
  };
  photos?: GooglePlacePhoto[];
  types?: string[];
}

/**
 * Geocoding result from Google Places(NEW) API
 */
export interface GooglePlacesResult {
  details?: GooglePlaceDetails;
  place?: string;
  placeId: string;
  structuredFormat: GooglePlaceStructuredFormat;
  text?: GooglePlaceTextResult;
  types: string[];
}

/**
 * Response from Google Geocoding API
 */
export interface GoogleGeocodingResponse {
  results: GooglePlacesResult[];
  status:
    | 'OK'
    | 'ZERO_RESULTS'
    | 'OVER_QUERY_LIMIT'
    | 'REQUEST_DENIED'
    | 'INVALID_REQUEST'
    | 'UNKNOWN_ERROR';
  error_message?: string;
}

/**
 * Geocode source types
 */
export type GeocodeSource = 'places_autocomplete' | 'reverse_geocode' | 'manual';

/**
 * Plus code information
 */
export interface GooglePlusCode {
  global_code: string;
  compound_code?: string;
}

/**
 * Stored geocoded components in database
 */
export interface StoredGeocodedComponents {
  addressComponents?: GoogleAddressComponent[];
  types?: string[];
  text?: GooglePlaceTextResult;
  photos?: GooglePlacePhoto[];
}

/**
 * Fields available for place details as per Google Places API.
 * Reference: https://developers.google.com/maps/documentation/places/web-service/place-details
 */
export type GooglePlacesFieldMask =
  | 'attributions'
  | 'id'
  | 'moved_place'
  | 'moved_place_id'
  | 'name*'
  | 'photos'
  | 'addressComponents'
  | 'addressDescriptor*'
  | 'adrFormatAddress'
  | 'formattedAddress'
  | 'location'
  | 'plusCode'
  | 'postalAddress'
  | 'shortFormattedAddress'
  | 'types'
  | 'viewport';
