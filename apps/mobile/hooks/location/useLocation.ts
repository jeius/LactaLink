import { LOCATION_UPDATES } from '@/lib/constants/taskNames';
import { startLocationUpdates } from '@/lib/location';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';
import { useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

export function useCurrentLocation() {
  const { data, ...rest } = useQuery({
    staleTime: 1000 * 60 * 1, // 1 minutes
    queryKey: ['current-location'],
    queryFn: async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
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

export function useLocationUpdates() {
  const { location: current, isLoading, error: currentLocError } = useCurrentLocation();

  const [location, setLocation] = useState(current);
  const [error, setError] = useState(currentLocError);

  // Shared value for animated coordinates
  const animatedCoords = useSharedValue({
    latitude: current?.coords.latitude || 0,
    longitude: current?.coords.longitude || 0,
  });

  // Derived value for safely accessing animated coordinates
  const derivedAnimatedCoords = useDerivedValue(() => ({
    latitude: animatedCoords.value.latitude,
    longitude: animatedCoords.value.longitude,
  }));

  const [animated, setAnimated] = useState({
    latitude: current?.coords.latitude || 0,
    longitude: current?.coords.longitude || 0,
  });

  useEffect(() => {
    console.log('Animated Location', derivedAnimatedCoords.get());
    setAnimated(derivedAnimatedCoords.get());
  }, [derivedAnimatedCoords]);

  useEffect(() => {
    const startUpdates = async () => {
      try {
        await startLocationUpdates();

        // Define the task to handle location updates
        TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
          LOCATION_UPDATES,
          async ({ data, error }) => {
            if (error) {
              const err = new Error('Error retrieving location', { cause: error });
              setError(err);
              console.error(err);
              return Promise.reject(err);
            }

            if (data && data.locations.length > 0) {
              const newLocation = data.locations[0]!;
              setLocation(newLocation);

              // Animate the transition of coordinates
              animatedCoords.value = {
                latitude: withTiming(newLocation.coords.latitude, { duration: 500 }),
                longitude: withTiming(newLocation.coords.longitude, { duration: 500 }),
              };
            }

            return Promise.resolve();
          }
        );
      } catch (err) {
        console.error('Error starting location updates:', err);
        setError(err as Error);
      }
    };

    startUpdates();

    return () => {
      // Cleanup: Unregister the task when the component unmounts
      TaskManager.unregisterTaskAsync(LOCATION_UPDATES).catch((err) =>
        console.error('Error unregistering location task:', err)
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    location,
    error,
    isLoading,
    animated: animated, // Return the derived value instead
  };
}
