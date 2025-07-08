import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { DELIVERY_OPTIONS } from '@/lib/constants';
import { CalendarDaysIcon, MapPinIcon } from 'lucide-react-native';

import { useFetchById } from '@/hooks/collections/useFetchById';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DeliveryPreference } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { formatDaysToText } from '@lactalink/utilities/formatters';
import { ComponentProps, ReactNode } from 'react';
import { Image } from '../Image';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';

export interface DeliveryPreferenceCardProps extends ComponentProps<typeof Card> {
  preference: Pick<DeliveryPreference, 'address' | 'preferredMode' | 'availableDays' | 'name'>;
  isLoading?: boolean;
  action?: ReactNode;
}
export function DeliveryPreferenceCard({
  preference,
  isLoading: isLoadingProp,
  action,
  ...props
}: DeliveryPreferenceCardProps) {
  const { address: addressProp, preferredMode, availableDays, name } = preference;

  const {
    data: addressDoc,
    isLoading,
    isFetching,
  } = useFetchById(typeof addressProp === 'string', {
    collection: 'addresses',
    id: extractID(addressProp),
    select: { name: true, displayName: true },
    depth: 0,
  });

  const address = typeof addressProp === 'string' ? addressDoc : addressProp;
  const addressName = address?.name || 'Address';
  const fullAddress = address?.displayName || 'Unknown Address';
  const preferenceName = name || `Delivery Preference`;
  const availableDaysText = formatDaysToText(availableDays);

  const cardStyle = tva({
    base: 'relative w-full',
  });

  return (
    <Card {...props} className={cardStyle({ className: props.className })}>
      {isLoadingProp ? (
        <CardPlaceholder />
      ) : (
        <HStack space="sm">
          <VStack space="sm" className="flex-1">
            <Text className="font-JakartaSemiBold flex-1">{preferenceName}</Text>

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
                    <AddressPlaceholder />
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
          {action && <VStack>{action}</VStack>}
        </HStack>
      )}
    </Card>
  );
}

function AddressPlaceholder() {
  return (
    <>
      <Skeleton variant="rounded" className="mb-1 h-5 w-36" />
      <Skeleton variant="rounded" className="h-4" />
    </>
  );
}

function CardPlaceholder() {
  return (
    <VStack space="lg">
      <Skeleton variant="rounded" className="h-8 w-40" />

      <VStack space="md">
        <HStack space="md" className="flex-wrap">
          <Skeleton variant="rounded" className="h-8 w-16" />
          <Skeleton variant="rounded" className="h-8 w-16" />
          <Skeleton variant="rounded" className="h-8 w-20" />
        </HStack>

        <Skeleton variant="rounded" className="h-5" />

        <VStack>
          <AddressPlaceholder />
        </VStack>
      </VStack>
    </VStack>
  );
}
