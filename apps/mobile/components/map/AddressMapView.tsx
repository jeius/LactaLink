import { StyleSheet } from 'react-native';

import React, { useEffect, useRef, useState } from 'react';

import MapView, { type MapViewProps } from '@/components/map/MapView';
import { getLottieAsset } from '@/lib/stores/assetsStore';
import { Coordinates } from '@lactalink/types';
import LottieView from 'lottie-react-native';
import { GoogleMapsViewRef } from 'react-native-google-maps-plus';
import { Box } from '../ui/box';
import { Spinner } from '../ui/spinner';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface AddressMapViewProps extends MapViewProps {
  coordinates?: Coordinates;
  isLoading?: boolean;
}

export function AddressMapView({
  coordinates,
  isLoading,
  children,
  ...props
}: AddressMapViewProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  useEffect(() => {
    if (coordinates && isMapReady && mapRef.current) {
      mapRef.current.setCamera({ center: coordinates, zoom: 16 }, false);
    }
  }, [coordinates, isMapReady]);

  return (
    <MapView
      {...props}
      mapRef={mapRef}
      initialProps={coordinates ? { camera: { center: coordinates } } : undefined}
      style={StyleSheet.flatten([StyleSheet.absoluteFillObject, props.style])}
      onMapReady={() => setIsMapReady(true)}
      onCameraChange={(_, __, isGesture) => {
        if (isGesture) {
          setIsPanning(true);
        }
        props.onCameraChange?.(_, __, isGesture);
      }}
      onCameraChangeComplete={(_, __, isGesture) => {
        if (isGesture) {
          setIsPanning(false);
        }
        props.onCameraChangeComplete?.(_, __, isGesture);
      }}
    >
      {isMapReady && !isLoading && (
        <VStack className="pointer-events-none absolute inset-0 items-center justify-center">
          <Text bold size="lg" className="absolute inset-x-5 text-center" style={{ top: '30%' }}>
            Pan the map to pin location
          </Text>

          <Box style={{ transform: [{ translateY: -32 }], width: 125, height: 125 }}>
            <LottieMarker isPanning={isPanning} />
          </Box>
        </VStack>
      )}

      {children}

      {isLoading && (
        <Box className="absolute inset-0 items-center justify-center bg-primary-0">
          <Spinner size={'large'} />
          <Text size="md" className="mt-2">
            Getting location...
          </Text>
        </Box>
      )}
    </MapView>
  );
}

interface LottieMarkerProps {
  isPanning: boolean;
}

function LottieMarker({ isPanning }: LottieMarkerProps) {
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    if (isPanning) {
      ref.current?.play(3, 20);
    } else {
      ref.current?.play(56, 82);
    }
  });

  return (
    <LottieView
      ref={ref}
      loop={false}
      source={getLottieAsset('mapPin')}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
