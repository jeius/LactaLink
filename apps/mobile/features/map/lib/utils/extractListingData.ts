import { Coordinates } from '@lactalink/types';
import { Collection } from '@lactalink/types/collections';
import { displayVolume } from '@lactalink/utilities';
import {
  extractCollection,
  extractImageData,
  extractOneImageData,
} from '@lactalink/utilities/extractors';
import { convertDistance, getDistance } from '@lactalink/utilities/geolib';
import { isDonation, isHospital, isMilkBank, isRequest } from '@lactalink/utilities/type-guards';
import { RNMarker } from 'react-native-google-maps-plus';
import { DataMarker, MapListingItem, MapListingSlug } from '../types';

export function extractListingData({
  listing,
  marker,
  userCoordinates,
}: {
  listing: Collection<MapListingSlug>;
  marker: RNMarker;
  userCoordinates: Coordinates | null;
}): MapListingItem | null {
  const coords = marker.coordinate;
  const distance = userCoordinates
    ? convertDistance(getDistance(userCoordinates, coords), 'km')
    : undefined;

  if (isDonation(listing)) {
    const {
      volume,
      donor,
      details: { milkSample },
    } = listing;

    const imageData = extractOneImageData(extractCollection(milkSample));
    return {
      slug: 'donations',
      title: displayVolume(volume),
      user: { relationTo: 'individuals', value: donor },
      image: imageData,
      distance: distance,
      coordinates: coords,
      markerID: marker.id,
    };
  } else if (isRequest(listing)) {
    const {
      initialVolumeNeeded,
      requester,
      details: { image },
    } = listing;

    const imageData = extractImageData(extractCollection(image));
    return {
      slug: 'requests',
      title: displayVolume(initialVolumeNeeded),
      user: { relationTo: 'individuals', value: requester },
      image: imageData,
      distance: distance,
      coordinates: coords,
      markerID: marker.id,
    };
  } else if (isHospital(listing) || isMilkBank(listing)) {
    const { displayName, name } = listing;
    const slug = isHospital(listing) ? 'hospitals' : 'milkBanks';
    const avatar = extractCollection(listing.avatar);
    const imageData = extractImageData(avatar);

    return {
      slug: slug,
      title: displayName || name,
      image: imageData,
      distance: distance,
      coordinates: coords,
      markerID: marker.id,
    };
  }

  return null;
}

export function getListings(
  markersMap: Map<string, DataMarker>,
  currentCoords: Coordinates | null
) {
  const donationsListings: MapListingItem[] = [];
  const requestsListings: MapListingItem[] = [];
  const hospitalsListings: MapListingItem[] = [];
  const milkBanksListings: MapListingItem[] = [];

  markersMap.forEach(({ data, marker }) => {
    if (!currentCoords) return;

    const listing = extractListingData({
      listing: data.value,
      marker,
      userCoordinates: currentCoords,
    });

    if (!listing) return;

    switch (data.relationTo) {
      case 'donations':
        donationsListings.push(listing);
        break;
      case 'requests':
        requestsListings.push(listing);
        break;
      case 'hospitals':
        hospitalsListings.push(listing);
        break;
      case 'milkBanks':
        milkBanksListings.push(listing);
        break;
      default:
        return;
    }
  });

  return { donationsListings, requestsListings, hospitalsListings, milkBanksListings };
}
