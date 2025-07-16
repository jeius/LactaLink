import { useLocationUpdates } from '@/hooks/location/useLocation';
import { StyleSheet } from 'react-native';
import RNMapView, { Camera, Details, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import React, { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';

import { Button, ButtonIcon } from '@/components/ui/button';
import { ErrorSearchParams } from '@lactalink/types';

import { useMagnetometer } from '@/hooks/location/useMagnetometer';
import { useRouter } from 'expo-router';
import { LocateIcon } from 'lucide-react-native';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Compass } from '../Compass';
import SafeArea from '../SafeArea';
import { Box } from '../ui/box';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { DefaultMarker } from './markers/DefaultMarker';
import { UserMarker } from './markers/UserMarker';

interface AddressMapViewProps extends ComponentProps<typeof RNMapView> {
  mapRef: React.RefObject<RNMapView | null>;
  isLoading?: boolean;
}

export function AddressMapView({
  mapRef,
  children,
  isLoading: isLoadingProp,
  ...props
}: AddressMapViewProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const initMapRef = useRef(false);

  const [followUser, setFollowUser] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const { heading, animatedHeading } = useMagnetometer({ updateInterval: 'fast' });
  const { location, error, isLoading: isLocationLoading } = useLocationUpdates();
  const isLoading = isLocationLoading || isLoadingProp;

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

  useEffect(() => {
    if (initMapRef.current) {
      if (!isLoading) {
        const { latitude, longitude } = coords;
        mapRef.current?.setCamera({ center: { latitude, longitude } });

        initMapRef.current = false;
        setTimeout(() => {
          setIsMapReady(true);
        }, 250); // Ensure the camera is set before marking the map as ready
      }
    }
  }, [coords, isLoading, mapRef]);

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
    if (mapRef.current && coords) {
      const { latitude, longitude } = coords;
      mapRef.current.animateCamera({ center: { latitude, longitude } }, { duration: 500 });
    }
  }

  function handleMapReady() {
    initMapRef.current = true;
  }

  async function handleRegionChangeEnd(region: Region, details: Details) {
    props.onRegionChangeComplete?.(region, details);
    const newCamera = await mapRef.current?.getCamera();
    if (newCamera) {
      setCamera(newCamera);
    }
  }

  return (
    <Box style={StyleSheet.absoluteFill}>
      <RNMapView
        {...props}
        ref={mapRef}
        initialCamera={props.initialCamera || camera}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        userInterfaceStyle={theme}
        showsMyLocationButton={false}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChangeEnd}
        onMapReady={handleMapReady}
      >
        {children}

        {location && isMapReady && (
          <UserMarker
            heading={heading}
            animatedHeading={animatedHeading}
            showAvatar={false}
            mapRef={mapRef}
            camera={camera}
            coordinates={location.coords}
          />
        )}
      </RNMapView>

      {!isMapReady ? (
        <SafeArea className="absolute inset-0 items-center justify-center">
          <Spinner size={'large'} />
          <Text size="md">Loading google maps...</Text>
        </SafeArea>
      ) : (
        <VStack className="relative flex-1 items-center justify-center">
          <Box style={{ position: 'absolute', right: 16, top: '40%' }}>
            <VStack space="md" className="shrink">
              {(camera.heading !== 0 || followUser) && (
                <AnimatedPressable onPress={handleCompassPress}>
                  <Box className="bg-background-0 rounded-full p-3">
                    <Compass heading={camera.heading} />
                  </Box>
                </AnimatedPressable>
              )}

              <Button
                action="info"
                className={`h-fit w-fit rounded-full p-3`}
                onPress={handleLocatePress}
                accessibilityLabel="Follow user location"
                accessibilityHint="Toggles following the user's current location"
                accessibilityRole="button"
                accessibilityState={{ selected: followUser }}
              >
                <ButtonIcon as={LocateIcon} height={22} width={22} />
              </Button>
            </VStack>
          </Box>

          <Box style={{ transform: [{ translateY: -16 }] }}>
            <DefaultMarker size={'md'} />
          </Box>
        </VStack>
      )}
    </Box>
  );
}
