import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';

export function useCurrentLocation() {
  const { data, ...rest } = useQuery({
    staleTime: 1000 * 60 * 1, // 1 minutes
    queryKey: ['current-location'],
    queryFn: async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const loc = await Location.getCurrentPositionAsync({});
      return loc;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  return { location: data, ...rest };
}
