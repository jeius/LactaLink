import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Coordinates } from '@lactalink/types';
import React, { useEffect, useRef, useState } from 'react';
import { PressableProps, StyleSheet } from 'react-native';
import MapView, { MapMarker } from 'react-native-maps';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Box } from '../ui/box';
import { Skeleton } from '../ui/skeleton';
import { Spinner } from '../ui/spinner';

const baseStyle = tva({
  base: 'relative h-32 w-full',
});

interface ThumbnailMapProps extends Pick<PressableProps, 'onPress' | 'disabled' | 'className'> {
  isLoading?: boolean;
  center: Coordinates;
  zoom?: number;
  pitch?: number;
  heading?: number;
}

export function ThumbnailMap({
  isLoading,
  disabled,
  onPress,
  center,
  className,
  zoom = 14,
  pitch = 0,
  heading = 0,
}: ThumbnailMapProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { theme } = useTheme();

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (isMapReady && mapLoaded) {
      mapRef.current?.setCamera({ zoom, center, heading, pitch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapReady, mapLoaded]);

  return (
    <Box className={baseStyle({ className })}>
      {isLoading ? (
        <Skeleton variant="sharp" className="h-full w-full" />
      ) : (
        <>
          {(!isMapReady || !mapLoaded) && (
            <Box className="bg-background-200 absolute inset-0 z-50">
              <Spinner size={'small'} className="m-auto" />
            </Box>
          )}

          <MapView
            id="thumbnail-map"
            ref={mapRef}
            cacheEnabled
            liteMode
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
            toolbarEnabled={false}
            userInterfaceStyle={theme}
            onMapLoaded={() => setMapLoaded(true)}
            onMapReady={() => setIsMapReady(true)}
            camera={{ zoom, center, heading, pitch }}
          >
            <MapMarker coordinate={center} pointerEvents="none" />
          </MapView>

          {onPress && (
            <AnimatedPressable
              disabled={disabled}
              disablePressAnimation
              className="grow"
              onPress={onPress}
            />
          )}
        </>
      )}
    </Box>
  );
}
