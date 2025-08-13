import { getApiClient } from '@lactalink/api';
import { Collection, CollectionSlug, Point, Where } from '@lactalink/types';
import { capitalizeFirst } from '@lactalink/utilities';
import { extractCollection } from '@lactalink/utilities/extractors';
import { PointExtractor, SpatialSearch, validatePoint } from '@lactalink/utilities/geo-utils';
import { isDonation, isHospital, isMilkBank, isRequest } from '@lactalink/utilities/type-guards';
import { useQuery } from '@tanstack/react-query';
import { MapMarker } from 'react-native-maps';
import { create } from 'zustand';
import { DONATION_REQUEST_STATUS, QUERY_KEYS } from '../constants';
import { MapMarkerProps, MarkerData, MarkerDataSlug, MarkersStoreState } from '../types/markers';

export type * from '@/lib/types/markers';

const pointExtractor: PointExtractor<MapMarkerProps> = (marker) => {
  return { x: marker.coordinate.longitude, y: marker.coordinate.latitude };
};

export const useMarkersStore = create<MarkersStoreState>(() => ({
  markerMap: new Map(),
  markersIndex: new SpatialSearch([], pointExtractor),
  selectedMarker: null,
}));

export function useInitializeMarkersIndex(enabled: boolean = true) {
  return useQuery({
    enabled,
    queryKey: [...QUERY_KEYS.MARKERS],
    queryFn: initializeMarkersIndex,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export async function initializeMarkersIndex() {
  resetMarkersStore();

  const markers = await Promise.all([
    createDataMarkers('donations'),
    createDataMarkers('requests'),
    createDataMarkers('hospitals'),
    createDataMarkers('milkBanks'),
  ]);

  console.log('Initializing Markers Index: donations', markers[0].length);
  console.log('Initializing Markers Index: requests', markers[1].length);
  console.log('Initializing Markers Index: hospitals', markers[2].length);
  console.log('Initializing Markers Index: milkBanks', markers[3].length);

  const markersIndex = new SpatialSearch(markers.flat(), pointExtractor);
  useMarkersStore.setState({ markersIndex });
  return markersIndex;
}

export function assignMarkerRef(identifier: string, marker: MapMarker | null) {
  const { markerMap } = useMarkersStore.getState();
  const markerData = markerMap.get(identifier);
  if (markerData) {
    markerData.markerRef = marker;
    markerMap.set(identifier, markerData);
  }
}

export function getMarkerRef(identifier: string): MapMarker | null {
  const { markerMap } = useMarkersStore.getState();
  const markerData = markerMap.get(identifier);
  return (markerData && markerData.markerRef) || null;
}

export function getMarkersIndex() {
  const { markersIndex } = useMarkersStore.getState();
  return markersIndex;
}

export function setSelectedMarker(identifier: string | null) {
  const { markerMap } = useMarkersStore.getState();

  if (!identifier) {
    useMarkersStore.setState({ selectedMarker: null });
    return;
  }

  const markerData = markerMap.get(identifier) || null;
  if (markerData) {
    useMarkersStore.setState({ selectedMarker: markerData });
  }
}

export function resetMarkersStore() {
  useMarkersStore.setState({
    markerMap: new Map(),
    markersIndex: new SpatialSearch([], pointExtractor),
    selectedMarker: null,
  });
}

export function createMarkerID<TSlug extends CollectionSlug>(
  slug: TSlug,
  id: Collection<TSlug>['id'],
  point: Point
) {
  const [longitude, latitude] = point;
  return `${slug}-${id}-${longitude}-${latitude}`;
}

export async function createDataMarkers<TSlug extends MarkerDataSlug>(slug: TSlug) {
  const apiClient = getApiClient();
  let where: Where | undefined;

  if (slug === 'donations' || slug === 'requests') {
    where = { status: { equals: DONATION_REQUEST_STATUS.AVAILABLE.value } };
  }

  const docs = await apiClient.find({
    collection: slug,
    where,
    depth: 3,
    pagination: false,
  });

  const markers: MapMarkerProps[] = [];

  for (const doc of docs) {
    if ((isDonation(doc) && slug === 'donations') || (isRequest(doc) && slug === 'requests')) {
      markers.push(...createMarkersFromDonationOrRequest(slug, doc));
    } else if (
      (slug === 'hospitals' && isHospital(doc)) ||
      (slug === 'milkBanks' && isMilkBank(doc))
    ) {
      const marker = createMarkerFromOrganization(slug, doc);
      if (!marker) {
        continue;
      }

      markers.push(marker);
    } else {
      console.warn(`Unsupported collection slug: ${slug}`);
      continue;
    }
  }

  return markers;
}

//#region Helpers
function createMarkersFromDonationOrRequest<
  TSlug extends Extract<CollectionSlug, 'donations' | 'requests'>,
>(slug: TSlug, data: Collection<TSlug>) {
  const { markerMap } = useMarkersStore.getState();
  const markers: MapMarkerProps[] = [];

  let volume = 0;
  let description = '';

  if (isDonation(data)) {
    volume = data.remainingVolume || 0;
    description = 'Available milk donation.';
  } else {
    volume = data.volumeNeeded;
    description = 'Open request for milk.';
  }

  const preferences = extractCollection(data.deliveryPreferences) || [];

  for (const preference of preferences) {
    const address = extractCollection(preference.address);
    const coordinates = address?.coordinates;

    if (!validatePoint(coordinates)) {
      continue;
    }

    const [longitude, latitude] = coordinates;
    const id = createMarkerID(slug, data.id, coordinates);

    const marker: MapMarkerProps = {
      id,
      identifier: id,
      coordinate: { latitude, longitude },
      title: data.title || `${capitalizeFirst(slug)} | ${volume} mL`,
      description,
    };

    const dataMarker: MarkerData<TSlug> = {
      slug,
      data,
      deliveryPreference: preference,
      marker,
    };

    markerMap.set(id, dataMarker);
    markers.push(marker);
  }

  return markers;
}

function createMarkerFromOrganization<
  TSlug extends Extract<CollectionSlug, 'hospitals' | 'milkBanks'>,
>(slug: TSlug, data: Collection<TSlug>): MapMarkerProps | null {
  const { markerMap } = useMarkersStore.getState();

  const availableVolume = data.totalVolume || 0;
  const owner = extractCollection(data.owner);
  const addresses = extractCollection(owner?.addresses?.docs) || [];
  const defaultAddress = addresses.find((address) => address.isDefault);

  if (!defaultAddress || !validatePoint(defaultAddress.coordinates)) {
    return null;
  }

  const [longitude, latitude] = defaultAddress.coordinates;

  const id = createMarkerID(slug, data.id, defaultAddress.coordinates);

  const marker: MapMarkerProps = {
    id,
    identifier: id,
    coordinate: { latitude, longitude },
    title: data.name,
    description: `${availableVolume} mL of milk available.`,
  };

  markerMap.set(id, { slug, data, marker, deliveryPreference: null });

  return marker;
}
//#endregion
