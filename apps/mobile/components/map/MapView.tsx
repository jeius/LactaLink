import { useCurrentLocation, useLocationUpdates } from '@/hooks/location/useLocation';
import { StyleSheet } from 'react-native';
import RNMapView, { Camera, MarkerAnimated, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner-native';

import { Button, ButtonIcon } from '@/components/ui/button';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { createMarkers } from '@/lib/utils/createMarkers';
import { Populate } from '@lactalink/types';

import { LocateFixedIcon, LocateIcon, SearchIcon } from 'lucide-react-native';
import { useTheme } from '../AppProvider/ThemeProvider';
import { CreateDonationRequestButton } from '../CreateDonationRequestButton';
import SafeArea from '../SafeArea';
import { Box } from '../ui/box';
import { Input, InputField, InputIcon } from '../ui/input';
import { Spinner } from '../ui/spinner';
import { VStack } from '../ui/vstack';
import { MapBottomSheet, MapBottomSheetProps } from './MapBottomSheet';

export function MapView() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const mapRef = useRef<RNMapView>(null);

  const [selectedItem, setSelectedItem] = useState<MapBottomSheetProps['value']>();
  const [followUser, setFollowUser] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(16);
  const debouncedSetZoom = debounce(setCurrentZoom, 100);
  const debouncedSetFollowUser = debounce(setFollowUser, 100, { trailing: true });

  const {
    location: initialLoc,
    error: initialError,
    isLoading: initialLoading,
  } = useCurrentLocation();
  const {
    location: { coords } = {},
    error: locError,
    isLoading: isLocLoading,
    animated,
  } = useLocationUpdates();

  const error = initialError || locError;
  const isLoading = initialLoading || isLocLoading;

  const initialPosition: Camera = {
    zoom: 16,
    heading: initialLoc?.coords?.heading || 0,
    pitch: 0,
    altitude: initialLoc?.coords?.altitude || undefined,
    center: {
      latitude: initialLoc?.coords?.latitude || 0,
      longitude: initialLoc?.coords?.longitude || 0,
    },
  };

  const currentPos: Partial<Camera> = useMemo(
    () => ({
      zoom: currentZoom,
      heading: coords?.heading || 0,
      altitude: coords?.altitude || undefined,
      center: {
        latitude: coords?.latitude || 0,
        longitude: coords?.longitude || 0,
      },
    }),
    [coords, currentZoom]
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

  const moveToCurrentPos = useCallback(() => {
    if (mapRef.current && currentPos) {
      mapRef.current.setCamera(currentPos);
    }
  }, [mapRef, currentPos]);

  useEffect(() => {
    if (error) {
      console.error('Error retrieving location:', error);
      toast.error(error.message);
    }
    if (followUser) {
      moveToCurrentPos();
    }

    return () => {
      debouncedSetZoom.cancel();
      debouncedSetFollowUser.cancel();
    };
  }, [debouncedSetFollowUser, debouncedSetZoom, error, followUser, moveToCurrentPos]);

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

  if (isLoading) {
    return (
      <SafeArea className="items-center justify-center">
        <Spinner size={'large'} />
      </SafeArea>
    );
  }

  return (
    <Box style={{ flex: 1, marginBottom: insets.bottom }}>
      <RNMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialCamera={initialPosition}
        userInterfaceStyle={theme}
        showsUserLocation
        followsUserLocation={followUser}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onPress={() => setSelectedItem(undefined)}
      >
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
      </RNMapView>

      <VStack className="relative flex-1" style={{ marginTop: insets.top }}>
        <Box style={{ position: 'absolute', right: 16, top: '40%' }}>
          <VStack space="md" className="shrink">
            <CreateDonationRequestButton
              action="positive"
              className="h-fit w-fit rounded-full p-3"
            />
            <Button
              className={`h-fit w-fit rounded-full p-3 ${followUser ? 'bg-primary-600' : ''}`}
              onPress={() => setFollowUser((prev) => !prev)}
              accessibilityLabel="Follow user location"
              accessibilityHint="Toggles following the user's current location"
              accessibilityRole="button"
              accessibilityState={{ selected: followUser }}
            >
              <ButtonIcon as={followUser ? LocateFixedIcon : LocateIcon} height={22} width={22} />
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
