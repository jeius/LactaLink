import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { convertDistance, getDistance } from '@lactalink/utilities/geolib';
import { RNLatLng as LatLng } from 'react-native-google-maps-plus';
import { getCurrentCoordinates } from '../stores/locationStore';

/**
 * Gets the nearest delivery preference based on provided coordinates.
 * @param deliveryPreferences - The delivery preferences to be selected.
 * @param locationCoords - The coordinates to measure the distance from. Defaults to user's current location.
 * @returns - An object containing the nearest delivery preference and its distance(km), or null if no preferences are available.
 */
export function getNearestDeliveryPreference<T extends DeliveryPreference[] | null | undefined>(
  deliveryPreferences: T,
  locationCoords?: LatLng | null
): T extends DeliveryPreference[]
  ? { deliveryPreference: DeliveryPreference | null; distance: number | null }
  : null {
  const currentLocationCoords = getCurrentCoordinates();
  const coords = locationCoords === undefined ? currentLocationCoords : locationCoords;

  if (!coords || !deliveryPreferences)
    return null as T extends DeliveryPreference[]
      ? { deliveryPreference: null; distance: null }
      : null;

  let minDistance = Infinity;
  let preference: DeliveryPreference | null = null;

  for (const pref of deliveryPreferences) {
    const address = extractCollection(pref.address);
    if (!address?.coordinates) continue;
    const [lng, lat] = address.coordinates;
    const distance = getDistance({ lat: coords.latitude, lng: coords.longitude }, { lat, lng });
    if (distance < minDistance) {
      minDistance = distance;
      preference = pref;
    }
  }

  if (!preference)
    return { deliveryPreference: null, distance: null } as T extends DeliveryPreference[]
      ? { deliveryPreference: DeliveryPreference | null; distance: number | null }
      : null;

  return {
    deliveryPreference: preference,
    distance: convertDistance(minDistance, 'km'),
  } as T extends DeliveryPreference[]
    ? { deliveryPreference: DeliveryPreference | null; distance: number | null }
    : null;
}
