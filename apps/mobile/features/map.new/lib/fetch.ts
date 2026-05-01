import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { getApiClient, getMatchingService } from '@/lib/services';
import { MapMarkersQueryOptions } from '@lactalink/form-schemas/validators';
import { Coordinates } from '@lactalink/types';
import { MapMarkersResult } from '@lactalink/types/api';
import { Collection } from '@lactalink/types/collections';
import { latLngToPoint } from '@lactalink/utilities/geo-utils';
import { BoundarySchema, DataMarkerSlug } from './types';

/**
 * Fetches lightweight map markers from the `/api/map-markers` endpoint for the
 * given viewport and optional marker-type filter.
 *
 * @param viewport - The visible map region expressed as a {@link BoundarySchema}.
 * @param types - Which marker types to include. Defaults to all four types when omitted.
 * @returns A flat array of `MapMarker` objects within the viewport.
 */
export async function fetchMapMarkers(
  viewport: BoundarySchema,
  types?: DataMarkerSlug[],
  init?: { signal?: AbortSignal }
): Promise<MapMarkersResult> {
  const apiClient = getApiClient();

  const searchParams: MapMarkersQueryOptions = { ...viewport };

  if (types && types.length > 0) {
    searchParams.types = types;
  }

  return apiClient.apiFetch<MapMarkersResult>('/map-markers', {
    ...init,
    method: 'GET',
    searchParams,
  });
}

export async function fetchMarkerData<T extends DataMarkerSlug>(
  {
    id,
    type,
  }: {
    id: string;
    type: T;
  },
  init?: RequestInit
): Promise<Collection<T>> {
  return getApiClient().findByID(
    {
      collection: type,
      id,
      depth: 2,
    },
    init
  ) as unknown as Promise<Collection<T>>;
}

export async function fetchDeliveryPreference(id: string, init?: RequestInit) {
  return getApiClient().findByID(
    {
      collection: 'delivery-preferences',
      id,
      depth: 1,
    },
    init
  );
}

export async function fetchNearestListings(
  {
    type,
    page,
    limit = 15,
    coordinates = PHILIPPINES_COORDINATES,
  }: {
    type: Extract<DataMarkerSlug, 'donations' | 'requests'>;
    coordinates: Coordinates | null | undefined;
    page: number;
    limit?: number;
  },
  init?: RequestInit
) {
  const point = latLngToPoint(coordinates);
  return getMatchingService().getNearestListings(
    { collection: type, location: point, page, limit, status: 'AVAILABLE', depth: 2 },
    { signal: init?.signal ?? undefined }
  );
}
