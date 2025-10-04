import { StyleSheet } from 'react-native';

import React, { useState } from 'react';

import { Coordinates } from '@lactalink/types';
import { Box } from '../ui/box';
import { Icon } from '../ui/icon';
import { BasicLocationPin } from '../ui/icon/custom';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { MapView, MapViewProps } from './MapView';

interface AddressMapViewProps extends MapViewProps {
  coordinates?: Coordinates;
}

export function AddressMapView({ coordinates, ...props }: AddressMapViewProps) {
  const [isMapReady, setIsMapReady] = useState(false);

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
        hideUserLocationHeading
      />

      {isMapReady && (
        <VStack className="absolute inset-0 items-center justify-center">
          <Text bold size="lg" className="absolute inset-x-5 text-center" style={{ top: '35%' }}>
            Pan the map to pin location
          </Text>

          <Box style={{ transform: [{ translateY: -20 }], position: 'relative' }}>
            <Box className="absolute inset-x-0" style={{ top: 6 }}>
              <Box className="bg-error-500 m-auto rounded-full" style={{ height: 18, width: 18 }} />
            </Box>
            <Icon as={BasicLocationPin} style={{ width: 40, height: 40 }} fill="red" />
          </Box>
        </VStack>
      )}
    </>
  );
}
