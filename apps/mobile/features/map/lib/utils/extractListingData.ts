import { getCurrentCoordinates } from '@/lib/stores';
import { getNearestDeliveryPreference } from '@/lib/utils/getNearestDeliveryPreference';
import { createMarkerID } from '@/lib/utils/markerUtils';
import { Collection } from '@lactalink/types/collections';
import { displayVolume } from '@lactalink/utilities';
import {
  extractCollection,
  extractImageData,
  extractOneImageData,
} from '@lactalink/utilities/extractors';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { convertDistance, getDistance } from '@lactalink/utilities/geolib';
import { isDonation, isHospital, isMilkBank, isRequest } from '@lactalink/utilities/type-guards';
import { MapListingItem, MapListingSlug } from '../types';
import { extractCoordsFromDP } from './extractCoordsFromDP';

export function extractListingData(listing: Collection<MapListingSlug>): MapListingItem | null {
  if (isDonation(listing)) {
    const {
      id,
      volume,
      donor,
      deliveryPreferences,
      details: { milkSample },
    } = listing;

    const nearest = getNearestDeliveryPreference(extractCollection(deliveryPreferences));
    const coordinates =
      nearest?.deliveryPreference && extractCoordsFromDP(nearest.deliveryPreference);

    if (!coordinates) return null;

    const imageData = extractOneImageData(extractCollection(milkSample));
    return {
      slug: 'donations',
      title: displayVolume(volume),
      user: { relationTo: 'individuals', value: donor },
      image: imageData,
      distance: nearest?.distance,
      coordinates,
      markerID: createMarkerID('donations', id, coordinates),
    };
  } else if (isRequest(listing)) {
    const {
      id,
      initialVolumeNeeded,
      requester,
      details: { image },
      deliveryPreferences,
    } = listing;

    const nearest = getNearestDeliveryPreference(extractCollection(deliveryPreferences));
    const coordinates =
      nearest?.deliveryPreference && extractCoordsFromDP(nearest.deliveryPreference);

    if (!coordinates) return null;

    const imageData = extractImageData(extractCollection(image));
    return {
      slug: 'requests',
      title: displayVolume(initialVolumeNeeded),
      user: { relationTo: 'individuals', value: requester },
      image: imageData,
      distance: nearest?.distance,
      coordinates,
      markerID: createMarkerID('requests', id, coordinates),
    };
  } else if (isHospital(listing) || isMilkBank(listing)) {
    const { id, displayName, name, owner } = listing;
    const addresses = extractCollection(extractCollection(owner)?.addresses?.docs);

    if (!addresses || addresses.length === 0) return null;

    const slug = isHospital(listing) ? 'hospitals' : 'milkBanks';
    const defaultAddress = addresses.find((addr) => addr.isDefault) ?? addresses[0]!;
    const coordinates = pointToLatLng(defaultAddress.coordinates);
    const currentCoordinates = getCurrentCoordinates();
    const avatar = extractCollection(listing.avatar);
    const imageData = extractImageData(avatar);
    const distance = currentCoordinates && getDistance(currentCoordinates, coordinates);
    return {
      slug: slug,
      title: displayName || name,
      coordinates: coordinates,
      markerID: createMarkerID(slug, id, coordinates),
      distance: distance && convertDistance(distance, 'km'),
      image: imageData,
    };
  }

  return null;
}
