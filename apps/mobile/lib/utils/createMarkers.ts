import { Donation, Request } from '@lactalink/types';
import {
  capitalizeFirst,
  extractCollection,
  isDonation,
  isPointInPolygon,
  validatePoint,
} from '@lactalink/utilities';
import { Region } from 'react-native-maps';
import { PREFERRED_STORAGE_TYPES } from '../constants';
import { MarkerDetails } from '../types/markers';
import { createPolygonFromRegion } from './createPolygonFromRegion';

export function createMarkers<TData extends Donation | Request>(data: TData, region?: Region) {
  let volume = 0;
  let storageType: keyof typeof PREFERRED_STORAGE_TYPES;

  if (isDonation(data)) {
    volume = data.remainingVolume || 0;
    storageType = data.details.storageType;
  } else {
    volume = data.volumeNeeded;
    storageType = data.details.storagePreference || PREFERRED_STORAGE_TYPES.EITHER.value;
  }

  const preferences = extractCollection(data.deliveryPreferences) || [];

  const markers: MarkerDetails<TData>[] = [];

  for (const preference of preferences) {
    const address = extractCollection(preference.address);
    const coordinates = address?.coordinates;

    // Validate coordinate values
    if (!validatePoint(coordinates)) {
      continue;
    }

    const [longitude, latitude] = coordinates;
    const slug = 'donor' in data ? 'donation' : 'request';
    const description =
      'donor' in data
        ? `${volume} mL of ${PREFERRED_STORAGE_TYPES[storageType].label} milk available.`
        : `${volume} mL of milk requested.`;

    const marker: MarkerDetails<TData> = {
      id: `${slug}-${data.id}-delivery-${preference.id}`,
      identifier: `${slug}-${data.id}-delivery-${preference.id}`,
      coordinate: { latitude, longitude },
      title: data.title || `${capitalizeFirst(slug)} | ${volume} mL`,
      description,
      data,
      deliveryPreference: preference,
    };

    if (region) {
      const polygon = createPolygonFromRegion(region);

      if (isPointInPolygon({ latitude, longitude }, polygon)) {
        markers.push(marker);
      }
    } else {
      markers.push(marker);
    }
  }

  return markers;
}
