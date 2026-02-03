import { StyleSheet } from 'react-native';

import React, { useEffect, useRef, useState } from 'react';

import MapView, { type MapViewProps } from '@/components/map/MapView';
import { getLottieAsset } from '@/lib/stores/assetsStore';
import { Coordinates } from '@lactalink/types';
import LottieView from 'lottie-react-native';
import { useMap } from '../contexts/MapProvider';
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

  return (
    <MapView
      {...props}
      initialProps={coordinates ? { camera: { center: coordinates, zoom: 16 } } : undefined}
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
      <MapCameraSetter coordinates={coordinates} />

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

function LottieMarker({ isPanning }: { isPanning: boolean }) {
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

function MapCameraSetter({ coordinates }: { coordinates?: Coordinates }) {
  const [map] = useMap();

  useEffect(() => {
    if (coordinates && map) {
      map.setCamera({ center: coordinates }, true, 300);
    }
  }, [coordinates, map]);

  return null;
}
