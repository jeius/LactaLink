import { useInitLocation } from '@/hooks/location/useLocation';
import RNMapView, { Details, LatLng, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import React, { ComponentProps, useEffect, useMemo, useState } from 'react';

import { ErrorSearchParams, Point } from '@lactalink/types';

import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { useMapStore } from '@/lib/stores/mapStore';
import { arePointsEqual, latLngToPoint } from '@lactalink/utilities/geo-utils';
import { LocationObjectCoords } from 'expo-location';
import { Redirect } from 'expo-router';
import { Insets, StyleSheet } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useTheme } from '../AppProvider/ThemeProvider';
import SafeArea from '../SafeArea';
import { Box } from '../ui/box';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { UserMarker } from './markers/UserMarker';

export interface MapViewProps extends ComponentProps<typeof RNMapView> {
  safeInsets?: Insets;
  hideUserLocationHeading?: boolean;
  isLoading?: boolean;
  containerStyle?: ComponentProps<typeof Box>['style'];
}
/**
 * Unstable MapView component using react-native-maps.
 * @deprecated Use MapView from '@/components/map/MapView' instead.
 */
export function MapView({
  children,
  safeInsets: insets,
  hideUserLocationHeading = false,
  isLoading: isLoadingProp,
  containerStyle,
  showsUserLocation = true,
  ...props
}: MapViewProps) {
  const { theme } = useTheme();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const cameraHeading = useSharedValue(0);

  const map = useMapStore((s) => s.map);
  const setFollowUser = useMapStore((s) => s.setFollowUser);
  const setMapRef = useMapStore((s) => s.setMapRef);
  const setUserMarkerRef = useMapStore((s) => s.setUserMarkerRef);
  const setUserLocated = useMapStore((s) => s.setUserLocated);
  const resetMap = useMapStore((s) => s.reset);

  const { location, error, ...locationQuery } = useInitLocation();

  const isLoading = isLoadingProp || locationQuery.isLoading;
  const isMapReady = mapReady && mapLoaded && !isLoading;

  const latlng = useMemo((): LatLng => {
    if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    }
    return PHILIPPINES_COORDINATES;
  }, [location]);

  useEffect(() => {
    if (isMapReady) {
      const center = props.initialCamera?.center || latlng;
      map?.setCamera({ zoom: 16, center });
      props.onMapReady?.();
    }
  }, [isMapReady]);

  useEffect(() => resetMap, []);

  async function handleRegionChangeEnd(region: Region, details: Details) {
    props.onRegionChangeComplete?.(region, details);

    if (details?.isGesture) {
      setFollowUser(false);
    }

    const userMarker = useMapStore.getState().userMarker;
    if (!userMarker) return;

    const userPosition = userMarker.getPosition();
    const userLocation: LatLng = {
      latitude: userPosition?.latitude || 0,
      longitude: userPosition?.longitude || 0,
    };

    const areEqual = arePointsEqual(latLngToPoint(region), latLngToPoint(userLocation));
    setUserLocated(areEqual);
  }

  function handleRegionChange(region: Region, details: Details) {
    props.onRegionChange?.(region, details);

    map?.getCamera().then((cam) => {
      cameraHeading.value = cam.heading;
    });
  }

  async function onUserMarkerPositionChange(position: LocationObjectCoords) {
    const { latitude, longitude } = position;
    const camera = await map?.getCamera();
    if (!camera) return;

    const cameraPoint: Point = [camera.center.longitude, camera.center.latitude];
    const userPoint: Point = [longitude, latitude];

    setUserLocated(arePointsEqual(cameraPoint, userPoint));
  }

  if (error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <Box className="relative flex-1" pointerEvents="box-none" style={containerStyle}>
      <RNMapView.Animated
        {...props}
        ref={setMapRef}
        initialCamera={
          props.initialCamera || {
            zoom: location?.coords ? 12 : 16,
            heading: 0,
            pitch: 0,
            center: latlng,
          }
        }
        style={StyleSheet.flatten([{ flex: 1 }, props.style])}
        mapPadding={
          props.mapPadding || { top: (insets?.top || 0) + 80, right: 0, bottom: 0, left: 0 }
        }
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle={theme}
        showsMyLocationButton={false}
        showsUserLocation={false}
        showsCompass={true}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChangeEnd}
        onRegionChange={handleRegionChange}
        onMapLoaded={() => setMapLoaded(true)}
        onMapReady={() => setMapReady(true)}
      >
        {children}

        {showsUserLocation && (
          <UserMarker
            ref={setUserMarkerRef}
            hideHeading={hideUserLocationHeading}
            onChangePosition={onUserMarkerPositionChange}
            mapHeading={cameraHeading}
          />
        )}
      </RNMapView.Animated>

      {!isMapReady && (
        <SafeArea className="absolute inset-0 z-50 items-center justify-center">
          <Spinner size={'large'} />
          <Text size="md">Loading google maps...</Text>
        </SafeArea>
      )}
    </Box>
  );
}
