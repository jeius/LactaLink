import { AppleMaps, CameraPosition, Coordinates, GoogleMaps } from 'expo-maps';
import { AppleMapsMarker } from 'expo-maps/build/apple/AppleMaps.types';
import { GoogleMapsColorScheme, GoogleMapsMarker } from 'expo-maps/build/google/GoogleMaps.types';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Pressable } from '../ui/pressable';
import { Text } from '../ui/text';

export interface MapTileButtonProps {
  coordinates?: Coordinates;
  onPress?: () => void;
}

export function MapTileButton({ coordinates = {}, onPress }: MapTileButtonProps) {
  const isAndroid = Platform.OS === 'android';
  const isIOS = Platform.OS === 'ios';

  const { theme } = useTheme();

  const googleMapsColorScheme: GoogleMapsColorScheme =
    theme === 'dark' ? GoogleMapsColorScheme.DARK : GoogleMapsColorScheme.LIGHT;

  const cameraPosition: CameraPosition = { zoom: 16, coordinates };

  const googleMarker: GoogleMapsMarker = { coordinates, showCallout: false };

  const appleMarker: AppleMapsMarker = { coordinates };

  function handlePress() {
    onPress?.();
  }

  if (isAndroid) {
    return (
      <Pressable className="flex-1" onPress={handlePress}>
        <GoogleMaps.View
          cameraPosition={cameraPosition}
          colorScheme={googleMapsColorScheme}
          style={{ flex: 1 }}
          markers={[googleMarker]}
          uiSettings={{
            zoomControlsEnabled: false,
            rotationGesturesEnabled: false,
            myLocationButtonEnabled: false,
            compassEnabled: false,
            indoorLevelPickerEnabled: false,
            zoomGesturesEnabled: false,
            scrollGesturesEnabled: false,
            tiltGesturesEnabled: false,
            mapToolbarEnabled: false,
            scaleBarEnabled: false,
            scrollGesturesEnabledDuringRotateOrZoom: false,
            togglePitchEnabled: false,
          }}
          properties={{
            isIndoorEnabled: false,
            isMyLocationEnabled: false,
          }}
        />
      </Pressable>
    );
  }

  if (isIOS) {
    return (
      <Pressable className="flex-1" onPress={handlePress}>
        <AppleMaps.View
          cameraPosition={cameraPosition}
          markers={[appleMarker]}
          style={{ flex: 1 }}
        />
      </Pressable>
    );
  }

  return <Text className="font-JakartaMedium">Unsupported Platform.</Text>;
}
