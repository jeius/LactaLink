import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Address } from '@lactalink/types';
import React, { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';

import { BasicBadge } from '@/components/badges';
import BasicLocationPin from '@/components/icons/BasicLocationPin';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { extractCollection, extractID, isString } from '@lactalink/utilities';
import { GestureResponderEvent, StyleSheet } from 'react-native';
import MapView, { LatLng, MapMarker, Marker } from 'react-native-maps';
import { Pressable } from '../ui/pressable';

const cardStyle = tva({
  base: '',
  variants: {
    mapVisible: {
      true: 'p-0',
    },
  },
});

interface AddressCardProps extends ComponentProps<typeof Card> {
  data: string | Address;
  isLoading?: boolean;
  showMap?: boolean;
  action?: React.ReactNode;
  disableTapOnMap?: boolean;
}

export function AddressCard({
  data: dataProp,
  isLoading: isLoadingProp,
  showMap = false,
  action,
  className,
  disableTapOnMap = false,
  ...props
}: AddressCardProps) {
  const mapRef = useRef<MapView>(null);
  const markerRef = useRef<MapMarker>(null);

  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  const shouldFetch = isString(dataProp);

  const { data: fetchedData, isLoading: isDataLoading } = useFetchById(shouldFetch, {
    collection: 'addresses',
    id: extractID(dataProp),
    depth: 0,
    select: { name: true, displayName: true, isDefault: true, coordinates: true },
  });

  const isLoading = isLoadingProp || isDataLoading;

  const data = shouldFetch ? fetchedData : extractCollection(dataProp);
  const { name, displayName, isDefault } = data || {};

  const [latitude, longitude] = data?.coordinates || [0, 0];
  const center: LatLng = useMemo(() => ({ latitude, longitude }), [latitude, longitude]);

  useEffect(() => {
    if (mapRef.current && isMapReady && !isMapLoading) {
      mapRef.current.animateCamera({ center });
      markerRef.current?.setCoordinates(center);
    }
  }, [center, isMapLoading, isMapReady]);

  function handleMapPress(e: GestureResponderEvent) {
    e.stopPropagation();
    // Navigate to map view or show map details
  }

  if (isLoading) {
    return (
      <Card {...props} className={cardStyle({ mapVisible: showMap, className })}>
        <VStack>
          <Skeleton variant="sharp" className="h-40 w-full" />
          <HStack space="sm" className={`w-full items-start ${showMap ? 'p-4' : ''}`}>
            <Icon as={BasicLocationPin} />
            <VStack space="xs" className="flex-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3" />
              <Skeleton className="h-3 w-32" />
            </VStack>
          </HStack>
        </VStack>
      </Card>
    );
  }

  return (
    <Card {...props} className={cardStyle({ mapVisible: showMap, className })}>
      <VStack className="w-full">
        {showMap && (
          <Box className="relative h-40 w-full">
            {isMapLoading && !isMapReady && (
              <Skeleton variant="sharp" className="absolute inset-0 z-50" />
            )}
            <MapView
              liteMode
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
              toolbarEnabled={false}
              onMapLoaded={() => setIsMapLoading(false)}
              onMapReady={() => setIsMapReady(true)}
              initialCamera={{
                zoom: 16,
                center,
                heading: 0,
                pitch: 0,
              }}
            >
              <Marker ref={markerRef} coordinate={center} pointerEvents="none" />
            </MapView>
            {!disableTapOnMap && <Pressable className="flex-1" onPress={handleMapPress} />}
          </Box>
        )}
        <HStack space="sm" className={`w-full items-start ${showMap ? 'p-4' : ''}`}>
          <Icon as={BasicLocationPin} />
          <Box className="flex-1">
            <HStack space="sm" className="w-full items-center">
              <Text ellipsizeMode="tail" numberOfLines={1} className="font-JakartaSemiBold shrink">
                {name}
              </Text>
              {action}
            </HStack>
            <HStack space="sm" className="mt-1 w-full items-center">
              <Text ellipsizeMode="tail" numberOfLines={2} size="sm" className="flex-1">
                {displayName}
              </Text>
              {isDefault && <BasicBadge size="sm" action="info" text="Default" />}
            </HStack>
          </Box>
        </HStack>
      </VStack>
    </Card>
  );
}
