import { DeliveryPreference } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { convertDistance, getDistance } from '@lactalink/utilities/geo-utils';
import { LatLng } from 'react-native-maps';

/**
 * Calculates the minimum distance from the user's location to any of the delivery preferences.
 * @param locationCoords - The coordinates of the user's location.
 * @param deliveryPreferences - The delivery preferences containing addresses with coordinates.
 * @returns The minimum distance in kilometers.
 */
export function getMinDistance(
  locationCoords: LatLng | null,
  deliveryPreferences: DeliveryPreference[] | null
) {
  if (!locationCoords || !deliveryPreferences) return null;

  let minDistance = Infinity;

  for (const pref of deliveryPreferences) {
    const address = extractCollection(pref.address);
    if (!address?.coordinates) continue;
    const [lng, lat] = address.coordinates;
    const distance = getDistance(
      { lat: locationCoords.latitude, lng: locationCoords.longitude },
      { lat, lng }
    );
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  return convertDistance(minDistance, 'km');
}
