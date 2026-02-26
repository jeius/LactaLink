import { QUERY_KEYS } from '@/lib/constants/queryKeys';
import { getDirectionsService } from '@/lib/services';
import { TravelMode } from '@lactalink/form-schemas/directions';
import { Coordinates } from '@lactalink/types';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export function useDirectionsQuery(
  args: {
    origin: Coordinates | undefined | null;
    destination: Coordinates | undefined | null;
    travelMode?: TravelMode;
  },
  options: { enabled?: boolean } = { enabled: true }
) {
  const { origin, destination, travelMode = 'DRIVE' } = args;
  const { enabled } = options;

  const { data, ...query } = useQuery({
    enabled: !!origin && !!destination && enabled,
    queryKey: [...QUERY_KEYS.DIRECTIONS, origin, destination, travelMode],
    queryFn: () => {
      if (!origin || !destination) return null;
      return getDirectionsService().getDirections({
        origin,
        destination,
        travelMode,
      });
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const directions = useMemo(() => {
    if (!data) return data;
    if (data.length === 0) return null;
    return data[0]!;
  }, [data]);

  return { ...query, data: directions };
}
