import { LOCATION_UPDATES } from '@/lib/constants/taskNames';
import { startBackgroundLocationUpdates, startForgroundLocationUpdates } from '@/lib/location';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useRef, useState } from 'react';

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
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  const { location: current, isLoading, error: currentLocError } = useCurrentLocation();

  const [location, setLocation] = useState(current);
  const [error, setError] = useState(currentLocError);

  useEffect(() => {
    const setupSubscription = async () => {
      const subscription = await startForgroundLocationUpdates(setLocation, (err) => {
        setError(new Error(err));
      });
      subscriptionRef.current = subscription;
    };

    setupSubscription();

    return () => {
      // Clean up the subscription when the component unmounts
      subscriptionRef.current?.remove();
    };
  }, []);

  return {
    location,
    error,
    isLoading,
  };
}

export function useBackgroundLocationUpdates() {
  const { location: current, isLoading, error: currentLocError } = useCurrentLocation();

  const [location, setLocation] = useState(current);
  const [error, setError] = useState(currentLocError);

  useEffect(() => {
    const startUpdates = async () => {
      try {
        await startBackgroundLocationUpdates();

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
  };
}
