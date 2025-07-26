import { useCurrentLocation } from '@/hooks/location/useLocation';
import { StyleSheet } from 'react-native';
import RNMapView, { Camera, Details, LatLng, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isEqual } from 'lodash';
import React, { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';

import { Button, ButtonIcon } from '@/components/ui/button';
import { ErrorSearchParams } from '@lactalink/types';

import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { LocationObjectCoords } from 'expo-location';
import { useRouter } from 'expo-router';
import { CompassIcon, LocateFixedIcon, LocateIcon, SearchIcon } from 'lucide-react-native';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Compass } from '../Compass';
import { DonateRequestModal } from '../modals';
import SafeArea from '../SafeArea';
import { Box } from '../ui/box';
import { Input, InputField, InputIcon } from '../ui/input';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { UserMarker, UserMarkerRef } from './markers/UserMarker';

interface MapViewProps extends ComponentProps<typeof RNMapView> {
  mapRef: React.RefObject<RNMapView | null>;
  dataReady?: boolean;
}

export function MapView({ dataReady = true, mapRef, children, ...props }: MapViewProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();

  const userMarkerRef = useRef<UserMarkerRef>(null);

  const { location, error, isLoading } = useCurrentLocation();

  const [followUser, setFollowUser] = useState(false);
  const [userPosition, setUserPosition] = useState<LocationObjectCoords>();
  const [showAvatar, setShowAvatar] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [renderMarkers, setMarkersRendered] = useState(false);

  const mapReady = useMemo(
    () => isMapReady && isMapLoaded && dataReady && !isLoading,
    [isMapReady, isMapLoaded, dataReady, isLoading]
  );

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

  const [camera, setCamera] = useState<Camera>({
    zoom: location?.coords ? 12 : 16,
    heading: 0,
    pitch: 0,
    center: {
      latitude: latlng.latitude,
      longitude: latlng.longitude,
    },
  });

  const isUserLocated = useMemo(() => {
    if (!userPosition) return false;
    return isCameraInCurrentPosition(camera, userPosition);
  }, [camera, userPosition]);

  useEffect(() => {
    if (mapReady) {
      const { latitude, longitude } = latlng;
      mapRef.current?.animateCamera({ zoom: 16, center: { latitude, longitude } });
      setTimeout(() => {
        setMarkersRendered(true);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, mapRef]);

  function handleCompassPress() {
    mapRef.current?.animateCamera(
      {
        heading: 0,
      },
      { duration: 400 }
    );
    setFollowUser(false);
  }

  function handleLocatePress() {
    if (isUserLocated && !followUser) {
      const currentHeading = userMarkerRef.current?.getHeading() || 0;

      mapRef.current?.animateCamera(
        { pitch: 65, zoom: Math.max(camera.zoom || 18, 18), heading: currentHeading - 90 },
        { duration: 500 }
      );

      setTimeout(() => {
        setFollowUser(true);
      }, 550);
    } else if (followUser) {
      setFollowUser(false);
      mapRef.current?.animateCamera(
        { pitch: 0, zoom: Math.min(camera.zoom || 18, 18) },
        { duration: 500 }
      );
    } else if (userPosition) {
      const { latitude, longitude } = userPosition;
      mapRef.current?.animateCamera({ center: { latitude, longitude } }, { duration: 500 });
    }
  }

  async function handleRegionChangeEnd(region: Region, details: Details) {
    props.onRegionChangeComplete?.(region, details);

    if (details?.isGesture) {
      setFollowUser(false);
    }

    const newCamera = await mapRef.current?.getCamera();
    if (newCamera) {
      setCamera(newCamera);
    }

    setShowAvatar(newCamera?.pitch === 0);
  }

  return (
    <Box style={{ flex: 1 }}>
      <RNMapView.Animated
        {...props}
        ref={mapRef}
        initialCamera={camera}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle={theme}
        showsMyLocationButton={false}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChangeEnd}
        onMapReady={() => setIsMapReady(true)}
        onMapLoaded={() => setIsMapLoaded(true)}
      >
        {renderMarkers && children}

        {location && renderMarkers && (
          <UserMarker
            ref={userMarkerRef}
            showAvatar={showAvatar}
            mapRef={mapRef}
            camera={camera}
            followUser={followUser}
            onChangePosition={setUserPosition}
          />
        )}
      </RNMapView.Animated>

      {!mapReady && (
        <SafeArea className="absolute inset-0 items-center justify-center">
          <Spinner size={'large'} />
          <Text size="md">Loading google maps...</Text>
        </SafeArea>
      )}

      <VStack className="relative flex-1" style={{ marginTop: insets.top }}>
        <Box style={{ position: 'absolute', right: 16, top: '40%' }}>
          <VStack space="md" className="shrink">
            {(camera.heading !== 0 || followUser) && (
              <AnimatedPressable onPress={handleCompassPress}>
                <Box className="bg-background-0 rounded-full p-3">
                  <Compass heading={camera.heading} />
                </Box>
              </AnimatedPressable>
            )}

            <DonateRequestModal />

            <Button
              action="info"
              className={`h-fit w-fit rounded-full p-3 ${followUser ? 'bg-info-600' : ''}`}
              onPress={handleLocatePress}
              accessibilityLabel="Follow user location"
              accessibilityHint="Toggles following the user's current location"
              accessibilityRole="button"
              accessibilityState={{ selected: followUser }}
            >
              <ButtonIcon
                as={followUser ? CompassIcon : isUserLocated ? LocateFixedIcon : LocateIcon}
                height={22}
                width={22}
              />
            </Button>
          </VStack>
        </Box>

        <Box className="px-5 py-2">
          <Input variant="rounded" className="bg-background-0 shadow-md">
            <InputIcon as={SearchIcon} className="text-primary-500 ml-3" />
            <InputField placeholder="Search donors, requesters, hospitals" />
          </Input>
        </Box>
      </VStack>
    </Box>
  );
}

function isCameraInCurrentPosition(
  camera: Camera,
  coords: { latitude: number; longitude: number }
): boolean {
  const { latitude, longitude } = coords;
  const cameraCenter = camera.center;

  const pointA: LatLng = {
    latitude: parseFloat(latitude.toFixed(4)),
    longitude: parseFloat(longitude.toFixed(4)),
  };
  const pointB: LatLng = {
    latitude: parseFloat(cameraCenter.latitude.toFixed(4)),
    longitude: parseFloat(cameraCenter.longitude.toFixed(4)),
  };
  return isEqual(pointA, pointB);
}
