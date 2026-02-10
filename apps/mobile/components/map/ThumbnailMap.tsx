import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Coordinates } from '@lactalink/types';
import { useRecyclingState } from '@shopify/flash-list';
import React, { useMemo } from 'react';
import { PressableProps, StyleSheet } from 'react-native';
import { GoogleMapsView, RNMarker } from 'react-native-google-maps-plus';
import { callback } from 'react-native-nitro-modules';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Box } from '../ui/box';
import { Pressable } from '../ui/pressable';
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
  const { theme } = useTheme();

  const markerID = useMemo(() => `marker-${center.latitude}-${center.longitude}`, [center]);

  const locationMarker: RNMarker = useMemo(() => {
    return {
      id: markerID,
      zIndex: 1000,
      coordinate: center,
    };
  }, [center, markerID]);

  const [mapLoaded, setMapLoaded] = useRecyclingState(false, [markerID]);

  return (
    <Box className={baseStyle({ className })}>
      {isLoading ? (
        <Skeleton variant="sharp" className="h-full w-full" />
      ) : (
        <>
          <GoogleMapsView
            initialProps={{
              camera: { zoom, center, bearing: heading, tilt: pitch },
              liteMode: true,
              mapId: `thumbnail-map-${markerID}`,
            }}
            style={StyleSheet.absoluteFill}
            myLocationEnabled={false}
            userInterfaceStyle={theme}
            markers={[locationMarker]}
            pointerEvents="none"
            onMapLoaded={callback(() => setMapLoaded(true))}
          />

          {!mapLoaded && (
            <Box className="absolute inset-0 z-50 items-center justify-center bg-background-200">
              <Spinner size={'small'} />
            </Box>
          )}

          {onPress && <Pressable disabled={disabled} className="grow" onPress={onPress} />}
        </>
      )}
    </Box>
  );
}
