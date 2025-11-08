import { DONATION_PIN, HOSPITAL_PIN, MILK_BANK_PIN, REQUEST_PIN } from '@/lib/constants/markerSvgs';
import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { getApiClient } from '@lactalink/api';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { Coordinates, ErrorSearchParams, Point } from '@lactalink/types';
import { Collection } from '@lactalink/types/collections';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { CollectionSlug, Where } from '@lactalink/types/payload-types';
import { displayVolume } from '@lactalink/utilities';
import {
  extractCollection,
  extractErrorMessage,
  extractName,
} from '@lactalink/utilities/extractors';
import { validatePoint } from '@lactalink/utilities/geo-utils';
import { PointExtractor, SpatialSearch } from '@lactalink/utilities/spatial-search';
import { isDonation, isHospital, isMilkBank, isRequest } from '@lactalink/utilities/type-guards';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { RNMarker } from 'react-native-google-maps-plus';
import { createStore, StoreApi, useStore } from 'zustand';

type DataMarkerSlug = Extract<CollectionSlug, 'donations' | 'requests' | 'hospitals' | 'milkBanks'>;

type DataMarker<TSlug extends DataMarkerSlug = DataMarkerSlug> = {
  slug: TSlug;
  data: Collection<TSlug>;
  deliveryPreference: DeliveryPreference | null;
  marker: RNMarker;
};

interface DataMarkerStore<TSlug extends DataMarkerSlug = DataMarkerSlug> {
  markerMap: Map<string, DataMarker<TSlug>>;
  markersIndex: SpatialSearch<RNMarker>;
  selectedDataMarker: DataMarker<TSlug> | null;
  setSelectedDataMarker: (markerID: string | null) => void;
}

interface DataMarkerProviderProps extends PropsWithChildren {
  selectedMarkerId?: string | null;
}

const ICON_SIZE = 48;

const DataMarkerStoreContext = createContext<StoreApi<DataMarkerStore> | null>(null);

const pointExtractor: PointExtractor<RNMarker> = (marker) => {
  return { x: marker.coordinate.longitude, y: marker.coordinate.latitude };
};

function useDataMarkerStore<T>(selector: (state: DataMarkerStore) => T) {
  const store = useContext(DataMarkerStoreContext);
  if (!store) {
    throw new Error('useDataMarkerStore must be used within a DataMarkerProvider');
  }
  return useStore(store, selector);
}

export function DataMarkerProvider({ children, selectedMarkerId }: DataMarkerProviderProps) {
  const [store] = useState(() =>
    createStore<DataMarkerStore>((set, get) => ({
      markerMap: new Map(),
      markersIndex: new SpatialSearch([], pointExtractor),
      selectedDataMarker: null,
      setSelectedDataMarker: (markerID) => {
        const marker = markerID ? get().markerMap.get(markerID) || null : null;
        set({ selectedDataMarker: marker });
      },
    }))
  );

  const { data, error } = useQuery({
    queryKey: QUERY_KEYS.MARKERS,
    queryFn: () => initializeMarkers(store.getState().markerMap),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (data) {
      const { selectedDataMarker: prevSelected } = store.getState();

      const { markers, map } = data;

      const markersIndex = new SpatialSearch(markers.flat(), pointExtractor);

      let selectedDataMarker =
        typeof selectedMarkerId === 'string' ? map.get(selectedMarkerId) : selectedMarkerId;

      if (prevSelected && selectedDataMarker === undefined) {
        // Retain the previous selected marker reference if no new selection is provided
        selectedDataMarker = prevSelected;
      } else if (prevSelected?.data.id === selectedDataMarker?.data.id) {
        // Retain the previous selected marker reference if the same marker is selected
        selectedDataMarker = prevSelected;
      }

      store.setState({ markersIndex, markerMap: map, selectedDataMarker });
    }
  }, [data, selectedMarkerId, store]);

  if (error) {
    const params: ErrorSearchParams = {
      title: 'Markers Failed',
      message: extractErrorMessage(error),
      action: 'go-back',
    };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <DataMarkerStoreContext.Provider value={store}>{children}</DataMarkerStoreContext.Provider>
  );
}

export const useDataMarkersIndex = () => useDataMarkerStore((state) => state.markersIndex);

export const useDataMarkerMap = () => useDataMarkerStore((state) => state.markerMap);

export function useSelectedDataMarker() {
  const value = useDataMarkerStore((state) => state.selectedDataMarker);
  const setValue = useDataMarkerStore((state) => state.setSelectedDataMarker);
  return [value, setValue] as const;
}

export function useResetDataMarkers() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKERS, exact: true });
  };
}

export function createMarkerID<TSlug extends CollectionSlug>(
  slug: TSlug,
  id: Collection<TSlug>['id'],
  point: Point
) {
  const [longitude, latitude] = point;
  return `${slug}-${id}-[${longitude},${latitude}]`;
}

export function destructureMarkerID(markerID: string): {
  slug: CollectionSlug;
  id: string;
  coordinates: Coordinates;
} | null {
  const parts = markerID.split('-');
  if (parts.length < 3) return null;

  const slug = parts[0] as CollectionSlug;
  const id = parts.slice(1, parts.length - 1).join('-');
  const coordPart = parts[parts.length - 1]!;
  const match = coordPart.match(/\[([-+]?[0-9]*\.?[0-9]+),([-+]?[0-9]*\.?[0-9]+)\]/);
  if (!match) return null;

  const longitude = parseFloat(match[1] ?? '0');
  const latitude = parseFloat(match[2] ?? '0');
  return { slug, id, coordinates: { latitude, longitude } };
}

//#region Helpers
async function initializeMarkers(oldMap: Map<string, DataMarker>) {
  const map = new Map(oldMap);

  const markers = await Promise.all([
    createDataMarkers('donations', map),
    createDataMarkers('requests', map),
    createDataMarkers('hospitals', map),
    createDataMarkers('milkBanks', map),
  ]);

  return { markers, map };
}

async function createDataMarkers<TSlug extends DataMarkerSlug>(
  slug: TSlug,
  map: Map<string, DataMarker>
) {
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

  const markers: RNMarker[] = [];

  for (const doc of docs) {
    if ((isDonation(doc) && slug === 'donations') || (isRequest(doc) && slug === 'requests')) {
      markers.push(...createMarkersFromDonationOrRequest(slug, doc, map));
    } else if (
      (slug === 'hospitals' && isHospital(doc)) ||
      (slug === 'milkBanks' && isMilkBank(doc))
    ) {
      const marker = createMarkerFromOrganization(slug, doc, map);
      if (marker) markers.push(marker);
    } else {
      console.warn(`Unsupported collection slug: ${slug}`);
      continue;
    }
  }

  return markers;
}

function createMarkersFromDonationOrRequest<
  TSlug extends Extract<CollectionSlug, 'donations' | 'requests'>,
>(slug: TSlug, data: Collection<TSlug>, map: Map<string, DataMarker>) {
  const markers: RNMarker[] = [];

  let title = '';
  let description = '';
  let svgString = '';

  if (isDonation(data)) {
    const name = extractName({ profile: { relationTo: 'individuals', value: data.donor } });
    title = `Donation: ${displayVolume(data.remainingVolume || 0)}`;
    description = `Donated by ${name}.`;
    svgString = DONATION_PIN;
  } else {
    const name = extractName({ profile: { relationTo: 'individuals', value: data.requester } });
    title = `Request: ${displayVolume(data.volumeNeeded)}`;
    description = `Requested by ${name}.`;
    svgString = REQUEST_PIN;
  }

  const preferences = extractCollection(data.deliveryPreferences) || [];

  for (const preference of preferences) {
    const address = extractCollection(preference.address);
    const coordinates = address?.coordinates;

    if (!validatePoint(coordinates)) continue;

    const [longitude, latitude] = coordinates;

    const id = createMarkerID(slug, data.id, coordinates);

    const marker: RNMarker = {
      id,
      coordinate: { latitude, longitude },
      title: title,
      snippet: description,
      iconSvg: { height: ICON_SIZE, width: ICON_SIZE, svgString },
      anchor: { x: 0.32, y: 1 },
      infoWindowAnchor: { x: 0.32, y: 0 },
    };

    const dataMarker: DataMarker<TSlug> = {
      slug,
      data,
      deliveryPreference: preference,
      marker,
    };

    map.set(id, dataMarker);
    markers.push(marker);
  }

  return markers;
}

function createMarkerFromOrganization<
  TSlug extends Extract<CollectionSlug, 'hospitals' | 'milkBanks'>,
>(slug: TSlug, data: Collection<TSlug>, map: Map<string, DataMarker>): RNMarker | null {
  const availableVolume = data.totalVolume || 0;
  const owner = extractCollection(data.owner);
  const addresses = extractCollection(owner?.addresses?.docs) || [];
  const defaultAddress = addresses.find((address) => address.isDefault);

  if (!defaultAddress || !validatePoint(defaultAddress.coordinates)) {
    return null;
  }

  const [longitude, latitude] = defaultAddress.coordinates;

  const id = createMarkerID(slug, data.id, defaultAddress.coordinates);

  const marker: RNMarker = {
    id,
    coordinate: { latitude, longitude },
    title: data.name,
    snippet: `${availableVolume} mL of milk available.`,
    iconSvg: {
      height: ICON_SIZE,
      width: ICON_SIZE,
      svgString: slug === 'hospitals' ? HOSPITAL_PIN : MILK_BANK_PIN,
    },
    anchor: { x: 0.32, y: 1 },
    infoWindowAnchor: { x: 0.32, y: 0 },
  };

  map.set(id, { slug, data, marker, deliveryPreference: null });
  return marker;
}
//#endregion
