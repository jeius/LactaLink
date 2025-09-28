import { useCurrentLocation } from '@/hooks/location/useLocation';
import RNMapView, { Details, LatLng, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { debounce } from 'lodash';
import React, { ComponentProps, useEffect, useMemo, useState } from 'react';

import { ErrorSearchParams, Point } from '@lactalink/types';

import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { useMapStore } from '@/lib/stores/mapStore';
import { arePointsEqual, latLngToPoint } from '@lactalink/utilities/geo-utils';
import { AnimatePresence, Motion } from '@legendapp/motion';
import { LocationObjectCoords } from 'expo-location';
import { Redirect } from 'expo-router';
import { Insets, StyleSheet } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Compass } from '../Compass';
import SafeArea from '../SafeArea';
import { Box } from '../ui/box';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { UserMarker } from './markers/UserMarker';

export interface MapViewProps extends ComponentProps<typeof RNMapView> {
  safeInsets?: Insets;
  hideUserLocationHeading?: boolean;
  isLoading?: boolean;
}

export function MapView({
  children,
  safeInsets: insets,
  hideUserLocationHeading = false,
  isLoading: isLoadingProp,
  ...props
}: MapViewProps) {
  const { theme } = useTheme();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const map = useMapStore((s) => s.map);
  const setFollowUser = useMapStore((s) => s.setFollowUser);
  const setMapRef = useMapStore((s) => s.setMapRef);
  const setUserMarkerRef = useMapStore((s) => s.setUserMarkerRef);
  const setUserLocated = useMapStore((s) => s.setUserLocated);

  const { location, error, ...locationQuery } = useCurrentLocation();

  const isLoading = isLoadingProp || locationQuery.isLoading;
  const isMapReady = mapReady && mapLoaded && !isLoading;

  const mapHeading = useSharedValue(0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady]);

  function handleCompassPress() {
    map?.animateCamera({ heading: 0 }, { duration: 400 });
    setFollowUser(false);
  }

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

  const updateMapHeading = debounce(async () => {
    const newCamera = await map?.getCamera();
    if (newCamera) {
      mapHeading.value = newCamera.heading || 0;
    }
  });

  async function handleRegionChange(region: Region, details: Details) {
    props.onRegionChange?.(region, details);

    if (details?.isGesture) {
      setFollowUser(false);
    }

    updateMapHeading();
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
    <>
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
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle={theme}
        showsMyLocationButton={false}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChangeEnd}
        onRegionChange={handleRegionChange}
        onMapLoaded={() => setMapLoaded(true)}
        onMapReady={() => setMapReady(true)}
      >
        {children}

        {location && (
          <UserMarker
            ref={setUserMarkerRef}
            hideHeading={hideUserLocationHeading}
            onChangePosition={onUserMarkerPositionChange}
          />
        )}
      </RNMapView.Animated>

      <AnimatePresence>
        {mapHeading.value !== 0 && (
          <Motion.View
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', right: 16, top: (insets?.top || 0) + 80 }}
          >
            <AnimatedPressable onPress={handleCompassPress}>
              <Box className="bg-background-0 rounded-full p-3">
                <Compass heading={mapHeading} />
              </Box>
            </AnimatedPressable>
          </Motion.View>
        )}
      </AnimatePresence>

      {!isMapReady && (
        <SafeArea className="absolute inset-0 z-50 items-center justify-center">
          <Spinner size={'large'} />
          <Text size="md">Loading google maps...</Text>
        </SafeArea>
      )}
    </>
  );
}
