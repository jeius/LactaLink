import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { pointToLatLng, validatePoint } from '@lactalink/utilities/geo-utils';

export function extractCoordsFromDP(pref: DeliveryPreference) {
  const address = extractCollection(pref.address);
  const coordinates = address?.coordinates;
  return validatePoint(coordinates) ? pointToLatLng(coordinates) : null;
}
