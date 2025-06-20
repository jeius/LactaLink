import { useLocationUpdates } from '@/hooks/location/useLocation';
import { useEffect, useRef } from 'react';
import { AnimatedRegion } from 'react-native-maps';

export function UserMarker() {
  const { location: { coords } = {}, error, isLoading } = useLocationUpdates();

  // Initialize AnimatedRegion for smooth animation
  const animatedCoords = useRef(
    new AnimatedRegion({
      latitude: coords?.latitude || 0,
      longitude: coords?.longitude || 0,
      latitudeDelta: 0.005, // Adjust as needed
      longitudeDelta: 0.005, // Adjust as needed
    })
  ).current;

  // Update AnimatedRegion when location changes
  useEffect(() => {
    if (coords) {
      animatedCoords
        .timing({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.005, // Adjust as needed
          longitudeDelta: 0.005, // Adjust as needed
          toValue: { x: coords.latitude, y: coords.longitude },
          duration: 1000, // Animation duration in milliseconds
          useNativeDriver: false, // Must be false for AnimatedRegion
        })
        .start();
    }
  }, [coords, animatedCoords]);
}
