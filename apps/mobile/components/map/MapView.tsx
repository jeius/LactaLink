import { useLocationUpdates } from '@/hooks/location/useLocation';
import { StyleSheet } from 'react-native';
import RNMapView, { Camera, Details, LatLng, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { debounce, isEqual } from 'lodash';
import React, { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';

import { Button, ButtonIcon } from '@/components/ui/button';
import { ErrorSearchParams } from '@lactalink/types';

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
import { UserMarker } from './markers/UserMarker';

interface MapViewProps extends ComponentProps<typeof RNMapView> {
  mapRef: React.RefObject<RNMapView | null>;
  dataReady?: boolean;
}

export function MapView({ dataReady = true, mapRef, children, ...props }: MapViewProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();

  const initMapRef = useRef(false);

  const [followUser, setFollowUser] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const { location, error, isLoading } = useLocationUpdates();
  const coords = useMemo(
    () => ({
      latitude: location?.coords.latitude || 0,
      longitude: location?.coords.longitude || 0,
    }),
    [location]
  );

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
    zoom: 16,
    heading: 0,
    pitch: 0,
    center: {
      latitude: coords.latitude,
      longitude: coords.longitude,
    },
  });

  const isCameraCentered = useMemo(
    () => isCameraInCurrentPosition(camera, coords),
    [camera, coords]
  );

  const setCameraOnRegionChange = debounce(
    async (_region: Region, details: Details) => {
      if (details?.isGesture) {
        const newCamera = await mapRef.current?.getCamera();
        setFollowUser(false);
        if (newCamera) {
          setCamera(newCamera);
        }
      }
    },
    200,
    { leading: true }
  );

  useEffect(() => {
    if (initMapRef.current) {
      if (dataReady && !isLoading) {
        const { latitude, longitude } = coords;
        mapRef.current?.setCamera({
          center: { latitude, longitude },
        });

        initMapRef.current = false;
        setTimeout(() => {
          setIsMapReady(true);
        }, 250); // Ensure the camera is set before marking the map as ready
      }
    }
  }, [coords, dataReady, isLoading, mapRef]);

  function handleCompassPress() {
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          heading: 0,
        },
        { duration: 400 }
      );
    }
    setFollowUser(false);
  }

  function handleLocatePress() {
    if (isCameraCentered && !followUser) {
      mapRef.current?.animateCamera(
        { pitch: 65, zoom: Math.max(camera.zoom || 18, 18) },
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
    } else if (mapRef.current && coords) {
      const { latitude, longitude } = coords;
      mapRef.current.animateCamera({ center: { latitude, longitude } }, { duration: 500 });
    }
  }

  function handleMapReady() {
    console.log('Map is ready, enabling location updates');
    initMapRef.current = true;
  }

  function handleRegionChange(region: Region, details: Details) {
    props.onRegionChange?.(region, details);
    setCameraOnRegionChange(region, details);
  }

  async function handleRegionChangeEnd() {
    const newCamera = await mapRef.current?.getCamera();
    if (newCamera) {
      setCamera(newCamera);
    }
  }

  return (
    <Box style={{ flex: 1 }}>
      <RNMapView
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
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeEnd}
        onMapReady={handleMapReady}
      >
        {children}

        {location && isMapReady && (
          <UserMarker mapRef={mapRef} followUser={followUser} coordinates={location.coords} />
        )}
      </RNMapView>

      {!isMapReady && (
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
                as={followUser ? CompassIcon : isCameraCentered ? LocateFixedIcon : LocateIcon}
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
