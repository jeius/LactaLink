import { QUERY_KEYS } from '@/lib/constants';
import { initializeMarkersIndex, MapMarkerProps } from '@/lib/stores/markersStore';
import { MapRegion } from '@lactalink/types';
import { regionToBoundary } from '@lactalink/utilities';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useVisibleMarkers(
  region: MapRegion,
  options: { enabled?: boolean } = { enabled: true }
) {
  const [markers, setMarkers] = useState<MapMarkerProps[]>([]);

  const queryResult = useQuery({
    enabled: options.enabled,
    queryKey: [...QUERY_KEYS.MARKERS],
    queryFn: initializeMarkersIndex,
  });

  useEffect(() => {
    const index = queryResult.data;
    if (index) {
      const visibleMarkers = index.searchByBoundary(regionToBoundary(region));
      setMarkers(visibleMarkers);
    }
  }, [queryResult.data, region]);

  return { ...queryResult, data: markers };
}
