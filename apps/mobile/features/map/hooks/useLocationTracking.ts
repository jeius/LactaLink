import { getDistance } from '@lactalink/utilities/geolib';
import { useCallback, useRef, useState } from 'react';
import { RNLatLng, RNLocation } from 'react-native-google-maps-plus';

/** Minimum movement in metres required to trigger a location state update. */
const MIN_LOCATION_DELTA_METERS = 5;

/**
 * Tracks device location updates, filtering out movements smaller than
 * {@link MIN_LOCATION_DELTA_METERS} metres to reduce unnecessary re-renders.
 *
 * @returns The latest location update and a stable handler to feed into the map.
 */
export function useLocationTracking() {
  const lastLocationRef = useRef<RNLatLng | null>(null);
  const [locationUpdates, setLocationUpdates] = useState<RNLocation | null>(null);

  const handleLocationUpdate = useCallback((location: RNLocation) => {
    const prev = lastLocationRef.current;
    if (prev && getDistance(prev, location.center) < MIN_LOCATION_DELTA_METERS) return;
    lastLocationRef.current = location.center;
    setLocationUpdates(location);
  }, []);

  return { locationUpdates, handleLocationUpdate };
}
