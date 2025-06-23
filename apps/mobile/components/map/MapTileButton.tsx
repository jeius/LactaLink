import { PHILIPPINES_COORDINATES } from '@/lib/constants';
import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Camera, LatLng, MapMarker, MarkerDragStartEndEvent } from 'react-native-maps';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Card } from '../ui/card';
import { Modal, ModalBackdrop, ModalContent } from '../ui/modal';
import { Pressable } from '../ui/pressable';

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

  const camera: Camera = { zoom: 16, center: coordinates, heading: 0, pitch: 0 };

  function handlePress() {
    setShowModal(true);
    onPress?.();
  }

  function handleDragEnd(e: MarkerDragStartEndEvent) {
    if (Platform.OS === 'ios') {
      return; // iOS does not support onDragEnd, use onPress instead
    }
    const coords = e.nativeEvent.coordinate;
    onLocationPin?.(coords);
  }

  return (
    <>
      <Pressable className="flex-1" onPress={handlePress}>
        <MapView
          initialCamera={camera}
          userInterfaceStyle={theme}
          liteMode
          style={StyleSheet.absoluteFill}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
          showsIndoorLevelPicker={false}
          pointerEvents="none"
        >
          <MapMarker coordinate={coordinates} tappable={false} pointerEvents="none" />
        </MapView>
      </Pressable>

      <Modal onClose={() => setShowModal(false)} isOpen={showModal}>
        <ModalBackdrop />
        <ModalContent>
          <Card variant="outline" size="md" className="p-0">
            <MapView
              initialCamera={camera}
              userInterfaceStyle={theme}
              liteMode
              style={{ width: '100%', height: 300 }}
              showsUserLocation={true}
              showsMyLocationButton={false}
              showsCompass={false}
              toolbarEnabled={false}
              showsIndoorLevelPicker={false}
              onPress={(e) => {
                const coords = e.nativeEvent.coordinate;
                onLocationPin?.(coords);
              }}
            />
          </Card>
        </ModalContent>
      </Modal>
    </>
  );
}
