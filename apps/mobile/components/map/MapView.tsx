import { useCurrentLocation } from '@/hooks/location/useLocation';
import RNMapView, { Details, LatLng, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { debounce } from 'lodash';
import React, { ComponentProps, useEffect, useMemo } from 'react';

import { ErrorSearchParams, Point } from '@lactalink/types';

import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { useMapStore } from '@/lib/stores/mapStore';
import { arePointsEqual } from '@lactalink/utilities/geo-utils';
import { LocationObjectCoords } from 'expo-location';
import { useRouter } from 'expo-router';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Compass } from '../Compass';
import SafeArea from '../SafeArea';
import { Box } from '../ui/box';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { UserMarker } from './markers/UserMarker';

type MapViewProps = ComponentProps<typeof RNMapView>;

export function MapView({ children, ...props }: MapViewProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();

  const isMapReady = useMapStore((s) => s.isMapReady);
  const map = useMapStore((s) => s.map);
  const setFollowUser = useMapStore((s) => s.setFollowUser);
  const setMapReady = useMapStore((s) => s.setMapReady);
  const setMapRef = useMapStore((s) => s.setMapRef);
  const setUserMarkerRef = useMapStore((s) => s.setUserMarkerRef);
  const setUserLocated = useMapStore((s) => s.setUserLocated);

  const { location, error, isSuccess } = useCurrentLocation();

  const mapHeading = useSharedValue(0);

  const mapReady = useMemo(() => isMapReady && isSuccess, [isMapReady, isSuccess]);

  const latlng = useMemo<LatLng>(() => {
    if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    }
    return PHILIPPINES_COORDINATES;
  }, [location]);

  if (error) {
    const errorParams: ErrorSearchParams = {
      message: error.message,
    };
    router.replace({
      pathname: '/error',
      params: errorParams,
    });
  }

  useEffect(() => {
    if (mapReady) {
      const { latitude, longitude } = latlng;
      map?.animateCamera({ zoom: 16, center: { latitude, longitude } }, { duration: 500 });

      return () => {
        setMapReady(false);
      };
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, map]);

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

    if (isRegionEqualsUserLocation(region, userLocation)) {
      setUserLocated(true);
    } else {
      setUserLocated(false);
    }
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

  return (
    <>
      <RNMapView.Animated
        {...props}
        ref={setMapRef}
        initialCamera={{
          zoom: location?.coords ? 12 : 16,
          heading: 0,
          pitch: 0,
          center: latlng,
        }}
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle={theme}
        showsMyLocationButton={false}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChangeEnd}
        onRegionChange={handleRegionChange}
        onMapReady={() => setMapReady(true)}
      >
        {children}

        {location && (
          <UserMarker ref={setUserMarkerRef} onChangePosition={onUserMarkerPositionChange} />
        )}
      </RNMapView.Animated>

      {!isMapReady && (
        <SafeArea className="absolute inset-0 items-center justify-center">
          <Spinner size={'large'} />
          <Text size="md">Loading google maps...</Text>
        </SafeArea>
      )}

      <Box style={{ position: 'absolute', right: 16, top: '10%', marginTop: insets.top }}>
        <AnimatedPressable onPress={handleCompassPress}>
          <Box className="bg-background-0 rounded-full p-3">
            <Compass heading={mapHeading} />
          </Box>
        </AnimatedPressable>
      </Box>
    </>
  );
}

function isRegionEqualsUserLocation(region: Region, userLocation: LatLng): boolean {
  const userPoint: Point = [userLocation.longitude, userLocation.latitude];
  const regionPoint: Point = [region.longitude, region.latitude];
  return arePointsEqual(userPoint, regionPoint);
}
