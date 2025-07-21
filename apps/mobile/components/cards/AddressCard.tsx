import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Address } from '@lactalink/types';
import React, { ComponentProps, useState } from 'react';

import { BasicBadge } from '@/components/badges';
import BasicLocationPin from '@/components/icons/BasicLocationPin';
import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { extractCollection, extractID, isString } from '@lactalink/utilities';
import { GestureResponderEvent, StyleSheet } from 'react-native';
import MapView, { LatLng, Marker } from 'react-native-maps';
import { Pressable } from '../ui/pressable';

interface AddressCardProps extends ComponentProps<typeof Card> {
  data: string | Address;
  isLoading?: boolean;
  showMap?: boolean;
  action?: React.ReactNode;
}

export function AddressCard({
  data: dataProp,
  isLoading: isLoadingProp,
  showMap = false,
  action,
  ...props
}: AddressCardProps) {
  const [isMapLoading, setIsMapLoading] = useState(true);

  const shouldFetch = isString(dataProp);

  const { data: fetchedData, isLoading: isDataLoading } = useFetchById(shouldFetch, {
    collection: 'addresses',
    id: extractID(dataProp),
    depth: 0,
  });

  const isLoading = isLoadingProp || isDataLoading;

  const data = shouldFetch ? fetchedData : extractCollection(dataProp);
  const { name, displayName, isDefault } = data || {};

  const [latitude, longitude] = data?.coordinates || [0, 0];
  const center: LatLng = { latitude, longitude };

  function handleMapPress(e: GestureResponderEvent) {
    e.stopPropagation();
    // Navigate to map view or show map details
  }

  if (isLoading) {
    return (
      <Card {...props}>
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
    <Card {...props}>
      <VStack>
        {showMap && (
          <Box className="relative h-40 w-full">
            {isMapLoading && <Skeleton variant="sharp" className="absolute inset-0 z-50" />}
            <MapView
              liteMode
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
              toolbarEnabled={false}
              camera={{
                zoom: 16,
                center,
                heading: 0,
                pitch: 0,
              }}
              onMapLoaded={() => setIsMapLoading(false)}
            >
              <Marker coordinate={center} pointerEvents="none" />
            </MapView>
            <Pressable className="flex-1" onPress={handleMapPress} />
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
