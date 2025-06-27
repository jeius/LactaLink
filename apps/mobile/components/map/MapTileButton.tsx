import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { LocateIcon, PinIcon } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Camera, LatLng, MapMarker, Region } from 'react-native-maps';
import { useTheme } from '../AppProvider/ThemeProvider';
import { GooglePlacesInput } from '../GooglePlacesInput';
import SafeArea from '../SafeArea';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Modal, ModalBackdrop, ModalCloseButton, ModalContent, ModalFooter } from '../ui/modal';
import { Pressable } from '../ui/pressable';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { DefaultMarker } from './markers/DefaultMarker';

export interface MapTileButtonProps {
  coordinates?: LatLng;
  onPress?: () => void;
  onLocationPin?: (coordinates: LatLng) => void;
}

export function MapTileButton({
  coordinates = PHILIPPINES_COORDINATES,
  onPress,
  onLocationPin,
}: MapTileButtonProps) {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const defaultRegion: Region = {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [selectedRegion, setSelectedRegion] = useState<Region>(defaultRegion);

  const mapRef = useRef<MapView>(null);
  const buttonMapRef = useRef<MapView>(null);
  const markerRef = useRef<MapMarker>(null);
  const userLocation: Camera = { zoom: 16, center: coordinates, heading: 0, pitch: 0 };

  function handlePress() {
    setShowModal(true);
    onPress?.();
  }

  function handleLocatePress() {
    mapRef.current?.animateCamera(
      {
        center: userLocation.center,
      },
      { duration: 500 }
    );
  }

  function handleMapReady() {
    setIsMapReady(true);
  }

  function handleRegionChangeComplete(region: Region) {
    setSelectedRegion(region);
  }

  function handleConfirm() {
    const newCoords: LatLng = {
      latitude: selectedRegion.latitude,
      longitude: selectedRegion.longitude,
    };

    onLocationPin?.(newCoords);

    buttonMapRef.current?.setCamera({
      center: newCoords,
    });

    markerRef.current?.setCoordinates(newCoords);

    setTimeout(() => {
      setShowModal(false);
    }, 500);
  }

  function handleSearchSelected({ location }: { location: LatLng }) {
    const newRegion: Region = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setSelectedRegion(newRegion);
    mapRef.current?.animateCamera({ center: location }, { duration: 500 });
  }

  return (
    <>
      <Pressable className="flex-1" onPress={handlePress}>
        <MapView
          ref={buttonMapRef}
          initialCamera={userLocation}
          userInterfaceStyle={theme}
          liteMode
          style={[StyleSheet.absoluteFill]}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
          showsIndoorLevelPicker={false}
          pointerEvents="none"
        >
          <MapMarker
            key={coordinates.latitude + coordinates.longitude}
            identifier={`marker-${coordinates.latitude + coordinates.longitude}`}
            ref={markerRef}
            coordinate={coordinates}
            tappable={false}
            pointerEvents="none"
          >
            <DefaultMarker size="sm" />
          </MapMarker>
        </MapView>
      </Pressable>

      <Modal onClose={() => setShowModal(false)} isOpen={showModal}>
        <ModalBackdrop />
        <ModalContent size="lg" className="h-full gap-4" style={{ maxHeight: 450 }}>
          <Box className="h-10" />
          <Box className="absolute inset-x-0 top-0 p-5" style={{ zIndex: 100 }}>
            <GooglePlacesInput onSelected={handleSearchSelected} />
          </Box>

          <Card
            variant="outline"
            size="lg"
            className="relative flex-1 items-center justify-center p-0"
          >
            <MapView
              ref={mapRef}
              initialCamera={userLocation}
              userInterfaceStyle={theme}
              style={StyleSheet.absoluteFill}
              showsUserLocation={false}
              showsMyLocationButton={false}
              showsCompass={true}
              toolbarEnabled={false}
              showsIndoorLevelPicker={false}
              onMapReady={handleMapReady}
              onRegionChangeComplete={handleRegionChangeComplete}
            />

            <Text
              size="md"
              pointerEvents="none"
              className="font-JakartaMedium absolute inset-x-0 top-0 text-center"
            >
              Pan the map to select a location
            </Text>

            <HStack className="absolute inset-x-0 bottom-0 w-full justify-end p-2">
              <Button
                action="info"
                size="xs"
                className="h-fit w-fit rounded-full p-3"
                onPress={handleLocatePress}
              >
                <ButtonIcon as={LocateIcon} height={16} width={16} />
                <ButtonText>My Location</ButtonText>
              </Button>
            </HStack>

            <Box style={{ transform: [{ translateY: -16 }] }}>
              <DefaultMarker size="sm" />
            </Box>

            {!isMapReady && (
              <SafeArea className="absolute inset-0 items-center justify-center">
                <Spinner size={'large'} />
                <Text size="md">Loading google maps...</Text>
              </SafeArea>
            )}
          </Card>

          <ModalFooter>
            <Button onPress={handleConfirm}>
              <ButtonIcon as={PinIcon} />
              <ButtonText>Confirm</ButtonText>
            </Button>

            <ModalCloseButton>
              <Button action="default" variant="link" pointerEvents="none">
                <ButtonText>Close</ButtonText>
              </Button>
            </ModalCloseButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
