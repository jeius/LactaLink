import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { DELIVERY_OPTIONS } from '@/lib/constants';
import { CalendarDaysIcon, MapPinIcon } from 'lucide-react-native';

import { useFetchById } from '@/hooks/collections/useFetchById';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DeliveryPreference } from '@lactalink/types';
import { extractCollection, extractID, isString } from '@lactalink/utilities';
import { formatDaysToText } from '@lactalink/utilities/formatters';
import { ComponentProps, ReactNode } from 'react';
import { Image } from '../Image';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';

const cardStyle = tva({
  base: 'relative w-full',
});

export interface DeliveryPreferenceCardProps extends ComponentProps<typeof Card> {
  preference: Pick<DeliveryPreference, 'address' | 'preferredMode' | 'availableDays' | 'name'>;
  isLoading?: boolean;
  action?: ReactNode;
}
export function DeliveryPreferenceCard({
  preference,
  isLoading: isLoadingProp,
  action,
  variant = 'filled',
  ...props
}: DeliveryPreferenceCardProps) {
  const { address: addressProp, preferredMode, availableDays, name } = preference;

  const shouldFetchAddress = isString(addressProp);
  const {
    data: fetchedAddress,
    isLoading,
    isFetching,
  } = useFetchById(shouldFetchAddress, {
    collection: 'addresses',
    id: extractID(addressProp),
    select: { name: true, displayName: true },
    depth: 0,
  });

  if (isLoadingProp) {
    return (
      <Card {...props} variant={variant} className={cardStyle({ className: props.className })}>
        <DeliveryPreferenceCardSkeleton />
      </Card>
    );
  }

  const preferenceName = name || `Delivery Preference`;
  const availableDaysText = formatDaysToText(availableDays);

  const address = shouldFetchAddress ? fetchedAddress : extractCollection(addressProp);
  const addressName = address?.name || 'Address';
  const fullAddress = address?.displayName || 'Unknown Address';

  return (
    <Card {...props} variant={variant} className={cardStyle({ className: props.className })}>
      <HStack space="sm">
        <VStack space="sm" className="flex-1">
          <HStack space="sm" className="w-full">
            <Text ellipsizeMode="tail" numberOfLines={1} className="font-JakartaSemiBold shrink">
              {preferenceName}
            </Text>
            {action}
          </HStack>

          <VStack space="md">
            <HStack space="sm" className="flex-wrap items-center">
              {preferredMode.map((mode, index) => {
                const iconAsset = getDeliveryPreferenceIcon(mode);
                return (
                  <HStack
                    key={index}
                    space="xs"
                    className="border-primary-500 items-center rounded-md border px-2 py-1"
                  >
                    <Image
                      source={iconAsset}
                      alt={`${mode}-icon`}
                      style={{ width: 16, height: 16 }}
                    />
                    <Text size="sm" className="text-primary-500 font-JakartaMedium">
                      {DELIVERY_OPTIONS[mode].label}
                    </Text>
                  </HStack>
                );
              })}
            </HStack>

            <HStack space="xs" className="items-start">
              <Icon as={CalendarDaysIcon} className="text-primary-500" />
              <Text size="sm" className="font-JakartaMedium flex-1">
                {availableDaysText}
              </Text>
            </HStack>

            <HStack space="xs" className="items-start">
              <Icon as={MapPinIcon} className="text-primary-500" />
              <VStack className="flex-1">
                {isLoading || isFetching ? (
                  <AddressSkeleton />
                ) : (
                  <>
                    <Text size="sm" className="font-JakartaMedium">
                      {addressName}
                    </Text>
                    <Text size="xs" className="font-JakartaMedium text-typography-700">
                      {fullAddress}
                    </Text>
                  </>
                )}
              </VStack>
            </HStack>
          </VStack>
        </VStack>
      </HStack>
    </Card>
  );
}

function AddressSkeleton() {
  return (
    <>
      <Skeleton className="mb-1 h-5 w-36" />
      <Skeleton className="h-4" />
    </>
  );
}

export function DeliveryPreferenceCardSkeleton() {
  return (
    <VStack space="lg">
      <Skeleton className="h-8 w-40" />

      <VStack space="md">
        <HStack space="md" className="flex-wrap">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </HStack>

        <Skeleton className="h-5" />

        <VStack>
          <AddressSkeleton />
        </VStack>
      </VStack>
    </VStack>
  );
}
