import { useCurrentLocation } from '@/hooks/location/useCurrentLocation';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner-native';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Button, ButtonIcon } from '@/components/ui/button';
import { useFetchBySlug } from '@/hooks/collections/useFetchBySlug';
import { Address, DeliveryPreference, STORAGE_TYPES } from '@lactalink/types';
import { CameraPosition, Coordinates, GoogleMaps } from 'expo-maps';
import {
  GoogleMapsColorScheme,
  GoogleMapsMapType,
  GoogleMapsMarker,
  GoogleMapsViewType,
} from 'expo-maps/build/google/GoogleMaps.types';
import { LocateFixedIcon, SearchIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreateDonationRequestButton } from '../CreateDonationRequestButton';
import SafeArea from '../SafeArea';
import { Box } from '../ui/box';
import { Input, InputField, InputIcon } from '../ui/input';
import { Spinner } from '../ui/spinner';
import { VStack } from '../ui/vstack';
import { MapBottomSheet, MapBottomSheetProps } from './MapBottomSheet';

export function GoogleMapView() {
  const inset = useSafeAreaInsets();
  const [selectedItem, setSelectedItem] = useState<MapBottomSheetProps>({});

  const { location, error, isLoading, isFetching } = useCurrentLocation();
  const { theme } = useTheme();
  const mapRef = useRef<GoogleMapsViewType>(null);

  const currentLocation: Coordinates | undefined =
    (location && { latitude: location.coords.latitude, longitude: location.coords.longitude }) ||
    undefined;

  const cameraPosition: CameraPosition | undefined =
    (location && {
      zoom: 16,
      coordinates: currentLocation,
    }) ||
    undefined;

  const googleMapsColorScheme: GoogleMapsColorScheme =
    theme === 'dark' ? GoogleMapsColorScheme.DARK : GoogleMapsColorScheme.LIGHT;

  const {
    data: donations,
    isLoading: isLoadingDonations,
    isFetching: isFetchingDonations,
    refetch: refetchDonations,
  } = useFetchBySlug('donations', true, {
    where: { status: { equals: 'AVAILABLE' } },
  });

  const {
    data: requests,
    isLoading: isLoadingRequests,
    isFetching: isFetchingRequests,
    refetch: refetchRequests,
  } = useFetchBySlug('requests', true, {
    where: { status: { equals: 'PENDING' } },
  });

  const markers: GoogleMapsMarker[] = [];

  if (donations && donations.length > 0) {
    for (const donation of donations) {
      const volume = donation.remainingVolume || 0;
      const storageType = donation.details.storageType;
      const address = (donation.deliveryDetails as DeliveryPreference[])?.[0]?.address as
        | Address
        | undefined;
      const [latitude, longitude] = (address && address.coordinates) || [];

      console.log('Donation coordinates:', latitude, longitude);

      if (latitude && longitude) {
        const marker: GoogleMapsMarker = {
          id: donation.id,
          coordinates: { latitude, longitude },
          title: donation.title || `Donation | ${volume} mL`,
          showCallout: true,
          draggable: false,
          snippet: `${volume} mL of ${STORAGE_TYPES[storageType].label} milk available.`,
        };
        markers.push(marker);
      }
    }
  }

  if (requests && requests.length > 0) {
    for (const request of requests) {
      const volume = request.volumeNeeded || 0;
      const address = (request.deliveryDetails as DeliveryPreference[])?.[0]?.address as
        | Address
        | undefined;
      const [latitude, longitude] = (address && address.coordinates) || [];

      console.log('Request coordinates:', latitude, longitude);

      if (latitude && longitude) {
        const marker: GoogleMapsMarker = {
          id: request.id,
          coordinates: { latitude, longitude },
          title: request.title || `Request | ${volume} mL`,
          showCallout: true,
          draggable: false,
          snippet: `${volume} mL of milk requested.`,
        };
        markers.push(marker);
      }
    }
  }

  useEffect(() => {
    if (error) {
      console.error('Error retrieving location:', error);
      toast.error(error.message);
    }
  }, [error]);

  function setCameraPostionToCurrentLocation() {
    if (mapRef.current && currentLocation) {
      mapRef.current.setCameraPosition(cameraPosition);
    }
  }

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
      setSelectedItem({});
    }
  }

  function handleMapClicked(_event: { coordinates: Coordinates }) {
    setSelectedItem({});
  }

  function handleSelectionChange(id: string) {
    const coord = markers.find((marker) => marker.id === id)?.coordinates;
    if (coord && mapRef.current) {
      mapRef.current.setCameraPosition({
        zoom: 19,
        coordinates: coord,
      });
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
        cameraPosition={cameraPosition}
        colorScheme={googleMapsColorScheme}
        userLocation={currentLocation && { coordinates: currentLocation, followUserLocation: true }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onMarkerClick={handleMarkerClicked}
        onMapClick={handleMapClicked}
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
        {isFetching && <Spinner size={'small'} className="absolute right-3 top-3 z-50" />}

        <Box style={{ position: 'absolute', right: 16, top: '40%' }}>
          <VStack space="md" className="shrink">
            <CreateDonationRequestButton
              action="positive"
              className="h-fit w-fit rounded-full p-3"
            />
            <Button
              className="h-fit w-fit rounded-full p-3"
              onPress={setCameraPostionToCurrentLocation}
            >
              <ButtonIcon as={LocateFixedIcon} height={22} width={22} />
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

      <MapBottomSheet {...selectedItem} onSelected={handleSelectionChange} />
    </Box>
  );
}
