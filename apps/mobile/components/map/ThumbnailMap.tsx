import { wrapCallback } from '@/lib/utils/wrapCallback';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Coordinates } from '@lactalink/types';
import React, { useEffect, useMemo, useRef } from 'react';
import { PressableProps, StyleSheet } from 'react-native';
import {
  GoogleMapsView,
  RNGoogleMapsPlusViewMethods,
  RNMarker,
} from 'react-native-google-maps-plus';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Box } from '../ui/box';
import { Pressable } from '../ui/pressable';
import { Skeleton } from '../ui/skeleton';

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
  const mapRef = useRef<RNGoogleMapsPlusViewMethods>(null);

  const markerID = useMemo(() => `marker-${center.latitude}-${center.longitude}`, [center]);

  const locationMarker: RNMarker = useMemo(() => {
    return {
      id: markerID,
      zIndex: 1000,
      coordinate: center,
    };
  }, [center, markerID]);

  useEffect(() => {
    if (isLoading) return;
    mapRef.current?.setCamera({ center }, false);
  }, [center, isLoading]);

  return (
    <Box className={baseStyle({ className })}>
      {isLoading ? (
        <Skeleton variant="sharp" className="h-full w-full" />
      ) : (
        <>
          <GoogleMapsView
            hybridRef={wrapCallback((ref) => {
              mapRef.current = ref.current;
            })}
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
          />

          {onPress && <Pressable disabled={disabled} className="grow" onPress={onPress} />}
        </>
      )}
    </Box>
  );
}
