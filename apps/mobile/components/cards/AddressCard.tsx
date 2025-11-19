import { BasicBadge } from '@/components/badges';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { Address } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { isString } from '@lactalink/utilities/type-guards';

import { ComponentProps, ReactNode, useMemo } from 'react';

import { useFetchById } from '@/hooks/collections/useFetchById';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { useRouter } from 'expo-router';
import { GestureResponderEvent } from 'react-native';
import { ThumbnailMap } from '../map/ThumbnailMap';
import { Button, ButtonText } from '../ui/button';
import { BasicLocationPin } from '../ui/icon/custom';

const cardStyle = tva({
  base: 'p-4',
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
  action?: ReactNode;
  disableTapOnMap?: boolean;
  disableLinks?: boolean;
}

export function AddressCard({
  data: dataProp,
  isLoading: isLoadingProp,
  showMap = false,
  action,
  className,
  disableTapOnMap = false,
  disableLinks = false,
  ...props
}: AddressCardProps) {
  const router = useRouter();
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

  const center = useMemo(() => pointToLatLng(data?.coordinates), [data?.coordinates]);

  function navigateToMap(e: GestureResponderEvent) {
    e.stopPropagation();
    if (!data) return;
    router.push(`/map/explore/address/${data.id}`);
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
      {isDefault && (
        <BasicBadge
          size="md"
          action="info"
          text="Default"
          className="absolute z-10"
          style={{ top: 8, right: 8 }}
        />
      )}
      <VStack className="w-full">
        {showMap && (
          <ThumbnailMap
            isLoading={isLoading}
            center={center}
            zoom={16}
            onPress={navigateToMap}
            className="h-40"
            disabled={disableTapOnMap}
          />
        )}
        <HStack space="sm" className={`w-full items-start ${showMap ? 'p-4' : ''}`}>
          <VStack className="flex-1 items-stretch">
            <HStack space="sm" className="w-full items-center justify-between">
              <Button
                variant="link"
                action="default"
                className="h-auto w-auto p-0"
                disablePressAnimation
                pointerEvents={disableLinks ? 'none' : 'auto'}
                onPress={navigateToMap}
                hitSlop={8}
              >
                <ButtonText
                  underlineOnPress
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  className="font-JakartaSemiBold"
                >
                  {name}
                </ButtonText>
              </Button>
              {action}
            </HStack>
            <HStack space="xs" className="mt-1 w-full items-start">
              <Icon as={BasicLocationPin} className="fill-primary-500" />
              <Text ellipsizeMode="tail" numberOfLines={2} size="sm" className="flex-1">
                {displayName}
              </Text>
            </HStack>
          </VStack>
        </HStack>
      </VStack>
    </Card>
  );
}
