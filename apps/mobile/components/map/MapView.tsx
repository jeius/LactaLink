import { useLocationUpdates } from '@/hooks/location/useLocation';
import { StyleSheet } from 'react-native';
import RNMapView, {
  Camera,
  Details,
  LatLng,
  MarkerAnimated,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { debounce, isEqual } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner-native';

import { Button, ButtonIcon } from '@/components/ui/button';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { createMarkers } from '@/lib/utils/createMarkers';
import { Populate } from '@lactalink/types';

import { CompassIcon, LocateFixedIcon, LocateIcon, SearchIcon } from 'lucide-react-native';
import { AnimatedMapView } from 'react-native-maps/src/MapView';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Compass } from '../Compass';
import { CreateDonationRequestButton } from '../CreateDonationRequestButton';
import SafeArea from '../SafeArea';
import { Box } from '../ui/box';
import { Input, InputField, InputIcon } from '../ui/input';
import { Spinner } from '../ui/spinner';
import { VStack } from '../ui/vstack';
import { MapBottomSheet, MapBottomSheetProps } from './MapBottomSheet';
import { UserMarker } from './markers/UserMarker';

export function MapView() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const mapRef = useRef<RNMapView>(null);

  const [selectedItem, setSelectedItem] = useState<MapBottomSheetProps['value']>();

  const [followUser, setFollowUser] = useState(false);

  const { location: { coords } = {}, error, isLoading } = useLocationUpdates();

  const [camera, setCamera] = useState<Camera>({
    zoom: 16,
    heading: 0,
    pitch: 0,
    center: {
      latitude: coords?.latitude || 0,
      longitude: coords?.longitude || 0,
    },
  });

  const isCameraCentered = useMemo(
    () => isCameraInCurrentPosition(camera, coords),
    [camera, coords]
  );

  const populate: Populate = {
    users: { profile: true },
    addresses: { coordinates: true, displayName: true },
    'delivery-preferences': { address: true, availableDays: true, preferredMode: true },
  };

  const { data: donations } = useFetchBySlug(true, {
    collection: 'donations',
    where: { status: { equals: 'AVAILABLE' } },
    populate,
  });

  const { data: requests } = useFetchBySlug(true, {
    collection: 'requests',
    where: { status: { equals: 'PENDING' } },
    populate,
  });

  const markers = createMarkers({ donations, requests });

  const handleRegionChange = debounce(
    async (_region: Region, details: Details) => {
      const newCamera = await mapRef.current?.getCamera();

      if (details?.isGesture) {
        setFollowUser(false);
      }

      if (newCamera) {
        console.log('New Camera Heading:', newCamera.heading);
        setCamera(newCamera);
      }
    },
    50,
    { leading: true, trailing: true }
  );

  useEffect(() => {
    if (error) {
      console.error('Error retrieving location:', error);
      toast.error(error.message);
    }
  }, [error]);

  function handleSelectionChange(value: NonNullable<MapBottomSheetProps['value']>) {
    const { id: idValue, slug: slugValue } = value;
    const marker = markers.find((marker) => {
      const [slug, id] = (marker.identifier && marker.identifier.split('-')) || ['', ''];
      return slug === slugValue && id === idValue;
    });

    const coord = marker?.coordinate;
    if (coord && mapRef.current) {
      mapRef.current.setCamera({
        zoom: 18,
        center: { latitude: coord.latitude || 0, longitude: coord.longitude || 0 },
      });
    }
    setSelectedItem(value);
  }

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
      setFollowUser(true);
      return;
    } else if (followUser) {
      setFollowUser(false);
      mapRef.current?.animateCamera({ pitch: 0 }, { duration: 500 });
      return;
    }

    if (mapRef.current && coords) {
      const { latitude, longitude } = coords;
      mapRef.current.animateCamera({ center: { latitude, longitude } }, { duration: 500 });
    }
  }

  if (isLoading) {
    return (
      <SafeArea className="items-center justify-center">
        <Spinner size={'large'} />
      </SafeArea>
    );
  }

  return (
    <Box style={{ flex: 1, marginBottom: insets.bottom }}>
      <AnimatedMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialCamera={camera}
        userInterfaceStyle={theme}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onPress={() => setSelectedItem(undefined)}
        onRegionChange={handleRegionChange}
      >
        <UserMarker mapRef={mapRef} followUser={followUser} coordinates={coords} />

        {markers.map((marker) => (
          <MarkerAnimated
            key={marker.identifier}
            {...marker}
            onPress={() => {
              if (!marker.identifier) return;
              setSelectedItem({
                id: marker.identifier.split('-')[1]!,
                slug: marker.identifier.split('-')[0] as 'donations' | 'requests',
              });
            }}
          />
        ))}
      </AnimatedMapView>

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

            <CreateDonationRequestButton
              action="positive"
              className="h-fit w-fit rounded-full p-3"
            />

            <Button
              className={`h-fit w-fit rounded-full p-3 ${followUser ? 'bg-primary-600' : ''}`}
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

      <MapBottomSheet value={selectedItem} onChange={handleSelectionChange} />
    </Box>
  );
}

function isCameraInCurrentPosition(
  camera: Camera,
  coords: { latitude: number; longitude: number } | undefined
): boolean {
  if (!coords) return false;
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
