import { BasicBadge } from '@/components/badges';
import { ThumbnailMap } from '@/components/map/ThumbnailMap';
import TruncatedText from '@/components/TruncatedText';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';

import { useAddress } from '@/features/address/hooks/queries';

import { isTempID } from '@/lib/utils/tempID';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { Address } from '@lactalink/types/payload-generated-types';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';

import { useRouter } from 'expo-router';
import { MapPinIcon } from 'lucide-react-native';
import { ReactNode, useCallback, useMemo } from 'react';
import { GestureResponderEvent, StyleSheet } from 'react-native';

const cardStyle = tva({
  base: 'p-0',
});

interface AddressCardProps extends CardProps {
  data: string | Address;
  isLoading?: boolean;
  action?: ReactNode;
  disableTapOnMap?: boolean;
  disableLinks?: boolean;
}

function AddressCard({
  data: dataProp,
  isLoading: isLoadingProp,
  action,
  className,
  disableTapOnMap = false,
  disableLinks = false,
  ...props
}: AddressCardProps) {
  const router = useRouter();

  const { data, ...query } = useAddress(dataProp);

  const isLoading = isLoadingProp || query.isLoading;

  const { name, displayName, isDefault } = data || {};

  const center = useMemo(() => pointToLatLng(data?.coordinates), [data?.coordinates]);

  const navigateToMap = useCallback(
    (e: GestureResponderEvent) => {
      e.stopPropagation();
      if (!data) return;
      router.push(`/addresses/${data.id}`);
    },
    [router, data]
  );

  if (isLoading || !data) {
    return <CardSkeleton {...props} className={cardStyle({ className })} />;
  }

  return (
    <Card
      {...props}
      className={cardStyle({ className })}
      style={StyleSheet.flatten([
        {
          opacity: isTempID(data.id) ? 0.6 : 1,
          pointerEvents: isTempID(data.id) ? 'none' : 'auto',
        },
        props.style,
      ])}
    >
      <ThumbnailMap
        isLoading={isLoading}
        center={center}
        zoom={16}
        onPress={navigateToMap}
        className="h-40"
        disabled={disableTapOnMap}
      />

      <VStack className="p-4">
        <HStack space="sm" className="items-center">
          <Box className="grow items-start">
            <Button
              variant="link"
              action="default"
              className="h-fit w-fit p-0"
              disablePressAnimation
              pointerEvents={disableLinks ? 'none' : 'auto'}
              onPress={navigateToMap}
              hitSlop={8}
            >
              <ButtonText>{name}</ButtonText>
            </Button>
          </Box>

          {action}
        </HStack>

        <HStack space="xs" className="mt-1 items-start">
          <Icon as={MapPinIcon} />
          <TruncatedText initialLines={2} size="sm" containerClassName="flex-1">
            {displayName}
          </TruncatedText>
        </HStack>
      </VStack>

      {isDefault && (
        <BasicBadge
          size="md"
          action="info"
          text="Default"
          className="absolute z-10"
          style={{ top: 8, right: 8 }}
        />
      )}
    </Card>
  );
}

function CardSkeleton({ className, ...props }: Pick<AddressCardProps, 'className'>) {
  return (
    <Card {...props} className={cardStyle({ className })}>
      <Skeleton variant="sharp" className="h-40" />
      <HStack space="sm" className="items-start p-4">
        <Icon as={MapPinIcon} />
        <VStack space="xs" className="flex-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3" />
          <Skeleton className="h-3 w-32" />
        </VStack>
      </HStack>
    </Card>
  );
}

export default Object.assign(AddressCard, {
  Skeleton: CardSkeleton,
});
