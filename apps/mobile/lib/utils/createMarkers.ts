import { STORAGE_TYPES } from '@/lib/constants';
import { Address, DeliveryPreference, Donation, Request } from '@lactalink/types';
import { GoogleMapsMarker } from 'expo-maps/build/google/GoogleMaps.types';

export function createAndroidMarkers({
  donations,
  requests,
}: {
  donations?: Donation[] | null;
  requests?: Request[] | null;
}): GoogleMapsMarker[] {
  const markers: GoogleMapsMarker[] = [];

  if (donations && donations.length > 0) {
    for (const donation of donations) {
      const volume = donation.remainingVolume || 0;
      const storageType = donation.details.storageType;
      const preferences = donation.deliveryDetails as DeliveryPreference[];

      for (const preference of preferences) {
        const address = preference.address as Address;
        const [latitude, longitude] = (address && address.coordinates) || [];

        if (latitude && longitude) {
          const marker: GoogleMapsMarker = {
            id: donation.id,
            coordinates: { latitude, longitude },
            title: donation.title || `Donation | ${volume} mL`,
            showCallout: true,
            draggable: false,
            snippet: `${volume} mL of ${STORAGE_TYPES[storageType].label} milk available.`,
          };
          markers.push(marker);
        }
      }
    }
  }

  if (requests && requests.length > 0) {
    for (const request of requests) {
      const volume = request.volumeNeeded || 0;
      const preferences = request.deliveryDetails as DeliveryPreference[];

      for (const preference of preferences) {
        const address = preference.address as Address;
        const [latitude, longitude] = (address && address.coordinates) || [];

        if (latitude && longitude) {
          const marker: GoogleMapsMarker = {
            id: request.id,
            coordinates: { latitude, longitude },
            title: request.title || `Request | ${volume} mL`,
            showCallout: true,
            draggable: false,
            snippet: `${volume} mL of milk requested.`,
          };
          markers.push(marker);
        }
      }
    }
  }

  return markers;
}
