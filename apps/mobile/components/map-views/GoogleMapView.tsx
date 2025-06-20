import { useCurrentLocation, useLocationUpdates } from '@/hooks/location/useLocation';

import { debounce, isEqual } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner-native';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Button, ButtonIcon } from '@/components/ui/button';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { createAndroidMarkers } from '@/lib/utils/createMarkers';
import { Populate } from '@lactalink/types';

import { CameraPosition, Coordinates, GoogleMaps, Coordinates as MapCoordinates } from 'expo-maps';
import {
  GoogleMapsColorScheme,
  GoogleMapsMapType,
  GoogleMapsMarker,
  GoogleMapsViewType,
} from 'expo-maps/build/google/GoogleMaps.types';

import { LocateFixedIcon, LocateIcon, SearchIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreateDonationRequestButton } from '../CreateDonationRequestButton';
import SafeArea from '../SafeArea';
import { Box } from '../ui/box';
import { Input, InputField, InputIcon } from '../ui/input';
import { Spinner } from '../ui/spinner';
import { VStack } from '../ui/vstack';
import { MapBottomSheet, MapBottomSheetProps } from './MapBottomSheet';

export function GoogleMapView() {
  const { theme } = useTheme();
  const inset = useSafeAreaInsets();
  const mapRef = useRef<GoogleMapsViewType>(null);

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

  const initialPosition: CameraPosition = {
    zoom: 16,
    coordinates: {
      latitude: animated.latitude,
      longitude: animated.longitude,
    },
  };

  const currentPos: CameraPosition = useMemo(
    () => ({
      zoom: currentZoom,
      coordinates: {
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      },
    }),
    [coords, currentZoom]
  );

  const googleMapsColorScheme: GoogleMapsColorScheme =
    theme === 'dark' ? GoogleMapsColorScheme.DARK : GoogleMapsColorScheme.LIGHT;

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

  const markers = createAndroidMarkers({ donations, requests });

  const moveToCurrentPos = useCallback(() => {
    if (mapRef.current && currentPos) {
      mapRef.current.setCameraPosition(currentPos);
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

  function handleMarkerClicked(marker: GoogleMapsMarker) {
    if (!marker.id) return;
    const donation = donations?.find((d) => d.id === marker.id);
    const request = requests?.find((r) => r.id === marker.id);

    if (donation) {
      setSelectedItem({
        slug: 'donations',
        id: donation.id,
      });
    } else if (request) {
      setSelectedItem({
        slug: 'requests',
        id: request.id,
      });
    } else {
      setSelectedItem(null);
    }
  }

  function handleMapClicked(_event: { coordinates: MapCoordinates }) {
    setSelectedItem(null);
  }

  function handleSelectionChange(value: NonNullable<MapBottomSheetProps['value']>) {
    const { id, slug: _ } = value;
    const coord = markers.find((marker) => marker.id === id)?.coordinates;
    if (coord && mapRef.current) {
      mapRef.current.setCameraPosition({
        zoom: 18,
        coordinates: coord,
      });
    }
    setSelectedItem(value);
  }

  function handleCameraMoved({
    zoom,
    coordinates,
  }: {
    zoom: number;
    coordinates: Coordinates;
  }): void {
    debouncedSetZoom(zoom);
    debouncedSetFollowUser(false);

    const roundedCoords = {
      latitude: parseFloat((coordinates.latitude || 0).toFixed(4)),
      longitude: parseFloat((coordinates.longitude || 0).toFixed(4)),
    };

    const roundedPosCoords = {
      latitude: parseFloat((currentPos.coordinates?.latitude || 0).toFixed(4)),
      longitude: parseFloat((currentPos.coordinates?.longitude || 0).toFixed(4)),
    };

    if (isEqual(roundedCoords, roundedPosCoords)) {
      debouncedSetFollowUser.cancel();
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
    <Box className="flex-1" style={{ marginBottom: inset.bottom }}>
      <GoogleMaps.View
        ref={mapRef}
        markers={markers}
        cameraPosition={initialPosition}
        colorScheme={googleMapsColorScheme}
        userLocation={{ coordinates: currentPos.coordinates || {}, followUserLocation: followUser }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onMarkerClick={handleMarkerClicked}
        onMapClick={handleMapClicked}
        onCameraMove={handleCameraMoved}
        uiSettings={{
          zoomControlsEnabled: false,
          rotationGesturesEnabled: true,
          myLocationButtonEnabled: false,
          mapToolbarEnabled: false,
        }}
        properties={{
          mapType: GoogleMapsMapType.NORMAL,
          isIndoorEnabled: false,
          isMyLocationEnabled: true,
        }}
      />

      <VStack className="relative flex-1" style={{ marginTop: inset.top }}>
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
              <ButtonIcon as={!followUser ? LocateFixedIcon : LocateIcon} height={22} width={22} />
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
