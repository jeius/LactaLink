import { DeliveryPreference } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { convertDistance, getDistance } from '@lactalink/utilities/geo-utils';
import { LatLng } from 'react-native-maps';
import { useLocationStore } from '../stores/locationStore';

/**
 * Calculates the minimum distance from a coordinates to any of the delivery preferences.
 * @param locationCoords - The coordinates to measure the distance from. Set null to use the user's current location.
 * @param deliveryPreferences - The delivery preferences containing addresses with coordinates.
 * @returns The minimum distance in kilometers.
 */
export function getMinDistance(
  locationCoords: LatLng | null,
  deliveryPreferences: DeliveryPreference[] | null
) {
  const currentLocationCoords = useLocationStore.getState().coordinates;
  const coords = locationCoords ?? currentLocationCoords;

  if (!coords || !deliveryPreferences) return null;

  let minDistance = Infinity;

  for (const pref of deliveryPreferences) {
    const address = extractCollection(pref.address);
    if (!address?.coordinates) continue;
    const [lng, lat] = address.coordinates;
    const distance = getDistance({ lat: coords.latitude, lng: coords.longitude }, { lat, lng });
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  return convertDistance(minDistance, 'km');
}
