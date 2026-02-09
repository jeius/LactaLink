import { Address } from '@lactalink/types/payload-generated-types';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import isEqual from 'lodash/isEqual';
import { CollectionBeforeChangeHook } from 'payload';

/**
 * Hook to preserve geocoding metadata when address is updated
 *
 * This hook ensures that geocoding data is not accidentally cleared
 * when users update their address through the UI.
 *
 * Note: Geocoding data should only be updated when:
 * 1. Coordinates are explicitly changed
 * 2. User searches with Google Places (frontend sets this data)
 * 3. User pins a new location (frontend calls reverse geocoding)
 */
export const preserveGeocodingMetadata: CollectionBeforeChangeHook<Address> = async ({
  data,
  originalDoc,
  operation,
}) => {
  // Only preserve on updates, not creates
  if (operation !== 'update' || !originalDoc) {
    return data;
  }

  // If coordinates haven't changed, preserve existing geocoding metadata
  const oldCoordinates = originalDoc.coordinates && pointToLatLng(originalDoc.coordinates);
  const newCoordinates = data.coordinates && pointToLatLng(data.coordinates);

  // If coordinates are the same and geocoding fields are not explicitly set, preserve them
  if (isEqual(oldCoordinates, newCoordinates)) {
    if (data.geocodedAddress === undefined && originalDoc.geocodedAddress) {
      data.geocodedAddress = originalDoc.geocodedAddress;
    }
    if (data.geocodedComponents === undefined && originalDoc.geocodedComponents) {
      data.geocodedComponents = originalDoc.geocodedComponents;
    }
    if (data.geocodedAt === undefined && originalDoc.geocodedAt) {
      data.geocodedAt = originalDoc.geocodedAt;
    }
    if (data.geocodeSource === undefined && originalDoc.geocodeSource) {
      data.geocodeSource = originalDoc.geocodeSource;
    }
  }

  return data;
};
