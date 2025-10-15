import { StyleSheet } from 'react-native';

import React, { useEffect, useRef, useState } from 'react';

import { getLottieAsset } from '@/lib/stores/assetsStore';
import { Coordinates } from '@lactalink/types';
import LottieView from 'lottie-react-native';
import { Box } from '../ui/box';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { MapView, MapViewProps } from './MapView';

interface AddressMapViewProps extends MapViewProps {
  coordinates?: Coordinates;
}

export function AddressMapView({ coordinates, ...props }: AddressMapViewProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  return (
    <>
      <MapView
        {...props}
        initialCamera={
          coordinates
            ? {
                center: coordinates,
                pitch: 0,
                heading: 0,
                zoom: 16,
              }
            : undefined
        }
        style={StyleSheet.flatten([StyleSheet.absoluteFillObject, props.style])}
        onMapReady={() => setIsMapReady(true)}
        onRegionChange={(_, { isGesture }) => {
          if (isGesture) {
            setIsPanning(true);
          }
        }}
        onRegionChangeComplete={(_, { isGesture }) => {
          if (isGesture) {
            setIsPanning(false);
          }
        }}
        hideUserLocationHeading
      />

      {isMapReady && (
        <VStack className="absolute inset-0 items-center justify-center">
          <Text bold size="lg" className="absolute inset-x-5 text-center" style={{ top: '30%' }}>
            Pan the map to pin location
          </Text>

          <Box style={{ transform: [{ translateY: -32 }], width: 125, height: 125 }}>
            <LottieMarker isPanning={isPanning} />
          </Box>
        </VStack>
      )}
    </>
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
