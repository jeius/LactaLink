import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { convertDistance, getDistance } from '@lactalink/utilities/geolib';
import { LatLng } from 'react-native-maps';
import { useLocationStore } from '../stores/locationStore';

/**
 * Calculates the minimum distance from a coordinates to any of the delivery preferences.
 * @param deliveryPreferences - The delivery preferences containing addresses with coordinates.
 * @param locationCoords - The coordinates to measure the distance from. Defaults to user's current location.
 * @returns The minimum distance in kilometers.
 */
export function getMinDistance<T extends DeliveryPreference[] | null | undefined>(
  deliveryPreferences: T,
  locationCoords?: LatLng | null
): T extends DeliveryPreference[] ? number | null : null {
  const currentLocationCoords = useLocationStore.getState().coordinates;
  const coords = locationCoords === undefined ? currentLocationCoords : locationCoords;

  if (!coords || !deliveryPreferences || !deliveryPreferences.length) {
    return null as T extends DeliveryPreference[] ? number : null;
  }

  let minDistance = Infinity; // Default to a large number if no preferences

  for (const pref of deliveryPreferences) {
    const address = extractCollection(pref.address);
    if (!address?.coordinates) continue;
    const [lng, lat] = address.coordinates;
    const distance = getDistance({ lat: coords.latitude, lng: coords.longitude }, { lat, lng });
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  return convertDistance(minDistance, 'km') as T extends DeliveryPreference[] ? number : null;
}
