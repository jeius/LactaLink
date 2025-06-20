import SafeArea from '@/components/SafeArea';
import { useCurrentLocation } from '@/hooks/location/useLocation';

import React, { useEffect } from 'react';
import { toast } from 'sonner-native';

import { AppleMaps, CameraPosition, Coordinates } from 'expo-maps';

export default function AppleMapView() {
  const { location, error } = useCurrentLocation();

  const currentLocation: Coordinates | undefined =
    (location && { latitude: location.coords.latitude, longitude: location.coords.longitude }) ||
    undefined;

  const cameraPosition: CameraPosition | undefined =
    (location && {
      zoom: 16,
      coordinates: currentLocation,
    }) ||
    undefined;

  useEffect(() => {
    if (error) {
      console.error('Error retrieving location:', error);
      toast.error(error.message);
    }
  }, [error]);

  return (
    <SafeArea mode="margin" safeTop={false}>
      <AppleMaps.View
        cameraPosition={cameraPosition}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </SafeArea>
  );
}
