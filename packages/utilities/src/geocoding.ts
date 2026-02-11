/**
 * Utility functions for handling geocoding data
 */

import {} from '@lactalink/form-schemas';
import { type AddressGeocoding } from '@lactalink/form-schemas/geocoding';
import type {
  GeocodeSource,
  GoogleAddressComponent,
  GooglePlacesResult,
  StoredGeocodedComponents,
} from '@lactalink/types/geocoding';
import { extractCoordinates } from './extractors';

/**
 * Extracts specific address component types from Google address components
 */
export function extractAddressComponent(
  components: GoogleAddressComponent[],
  type: string
): GoogleAddressComponent | undefined {
  return components.find((component) => component.types?.includes(type));
}

/**
 * Extracts multiple address components by type
 */
export function extractAddressComponents(
  components: GoogleAddressComponent[],
  types: string[]
): Record<string, GoogleAddressComponent | undefined> {
  const result: Record<string, GoogleAddressComponent | undefined> = {};
  types.forEach((type) => {
    result[type] = extractAddressComponent(components, type);
  });
  return result;
}

/**
 * Formats Google geocoding result for storage in database
 */
export function formatGeocodingForStorage(
  result: GooglePlacesResult,
  source: GeocodeSource
):
  | (Omit<AddressGeocoding, 'geocodedComponents'> & {
      geocodedComponents?: StoredGeocodedComponents;
    })
  | null {
  const { details, types, text } = result;

  if (!details) return null;

  const { addressComponents, photos, formattedAddress } = details;

  return {
    geocodedAddress: formattedAddress,
    geocodedAt: new Date(),
    geocodeSource: source,
    coordinates: extractCoordinates(details.location, { throwError: true }),
    geocodedComponents: { addressComponents, types, text, photos },
  };
}

/**
 * Finds the most specific administrative area (city/municipality) from address components
 */
export function findCityFromComponents(components: GoogleAddressComponent[]): string | undefined {
  // Priority order for city-level components
  const cityTypes = [
    'locality', // City or town
    'administrative_area_level_3', // Third-level (sometimes municipality)
  ];

  for (const type of cityTypes) {
    const component = extractAddressComponent(components, type);
    if (component) {
      return component.longText;
    }
  }

  return undefined;
}

/**
 * Finds the province from address components
 */
export function findProvinceFromComponents(
  components: GoogleAddressComponent[]
): string | undefined {
  const provinceComponent = extractAddressComponent(components, 'administrative_area_level_2');
  return provinceComponent?.longText;
}

/**
 * Finds the barangay from address components
 */
export function findBarangayFromComponents(
  components: GoogleAddressComponent[]
): string | undefined {
  // In Philippines, barangay is typically in sublocality_level_1 or neighborhood
  const barangayTypes = ['sublocality_level_2', 'neighborhood', 'sublocality'];

  for (const type of barangayTypes) {
    const component = extractAddressComponent(components, type);
    if (component) {
      return component.longText;
    }
  }

  return undefined;
}

/**
 * Extracts street address from address components
 */
export function findStreetFromComponents(components: GoogleAddressComponent[]): string | undefined {
  const streetNumber = extractAddressComponent(components, 'street_number');
  const route = extractAddressComponent(components, 'route');

  if (streetNumber && route) {
    return `${streetNumber.longText} ${route.longText}`;
  } else if (route) {
    return route.longText;
  }

  return undefined;
}

/**
 * Extracts postal code from address components
 */
export function findPostalCodeFromComponents(
  components: GoogleAddressComponent[]
): string | undefined {
  const postalCode = extractAddressComponent(components, 'postal_code');
  return postalCode?.longText;
}

/**
 * Parses all relevant location data from Google geocoding result
 */
export function parseGooglePlacesResult(result: GooglePlacesResult) {
  const { details } = result;

  if (!details) {
    throw new Error('GooglePlacesResult is missing details');
  }

  const { addressComponents, formattedAddress } = details;

  return {
    street: addressComponents && findStreetFromComponents(addressComponents),
    barangay: addressComponents && findBarangayFromComponents(addressComponents),
    city: addressComponents && findCityFromComponents(addressComponents),
    province: addressComponents && findProvinceFromComponents(addressComponents),
    zipCode: addressComponents && findPostalCodeFromComponents(addressComponents),
    coordinates: extractCoordinates(details),
    formattedAddress,
  };
}
