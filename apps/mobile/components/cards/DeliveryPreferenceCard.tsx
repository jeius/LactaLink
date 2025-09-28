import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { CalendarDaysIcon, MapPinIcon } from 'lucide-react-native';

import { useFetchById } from '@/hooks/collections/useFetchById';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { formatDaysToText } from '@lactalink/utilities/formatters';
import { isString } from '@lactalink/utilities/type-guards';
import { Link } from 'expo-router';
import { ComponentProps, ReactNode } from 'react';
import { Image } from '../Image';
import { Button, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';

const cardStyle = tva({
  base: 'relative w-full',
});

export interface DeliveryPreferenceCardProps extends ComponentProps<typeof Card> {
  preference: string | DeliveryPreference;
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
  const dpQuery = useFetchById(isString(preference), {
    collection: 'delivery-preferences',
    id: extractID(preference),
    select: { name: true, address: true, availableDays: true, preferredMode: true },
    populate: { addresses: { name: true, displayName: true, coordinates: true, isDefault: true } },
    depth: 3,
  });

  const deliveryPreference = extractCollection(preference) || dpQuery.data;

  const { preferredMode, availableDays, name } = deliveryPreference || {};

  const addressQuery = useFetchById(isString(deliveryPreference?.address), {
    collection: 'addresses',
    id: extractID(deliveryPreference?.address) || '',
    select: { name: true, displayName: true, coordinates: true, isDefault: true },
    depth: 0,
  });

  const isLoading = isLoadingProp || dpQuery.isLoading || addressQuery.isLoading;

  const preferenceName = name || `Delivery Preference`;
  const availableDaysText = formatDaysToText(availableDays || []);

  const prefID = deliveryPreference?.id || '';
  const address = extractCollection(deliveryPreference?.address) || addressQuery.data;
  const addressName = address?.name || 'Address';
  const fullAddress = address?.displayName || 'Unknown Address';

  if (isLoading) {
    return (
      <Card {...props} variant={variant} className={cardStyle({ className: props.className })}>
        <DeliveryPreferenceCardSkeleton />
      </Card>
    );
  }

  return (
    <Card {...props} variant={variant} className={cardStyle({ className: props.className })}>
      <HStack space="sm">
        <VStack space="sm" className="flex-1">
          <HStack space="sm" className="w-full">
            <Link asChild href={`/delivery-preferences/${prefID}`}>
              <Button
                animateOnPress={false}
                variant="link"
                action="default"
                className="h-fit w-fit p-0"
              >
                <ButtonText underlineOnPress>{preferenceName}</ButtonText>
              </Button>
            </Link>
            {action}
          </HStack>

          <VStack space="md">
            <HStack space="sm" className="flex-wrap items-center">
              {preferredMode?.map((mode, index) => {
                const iconAsset = getDeliveryPreferenceIcon(mode);
                return (
                  <Card
                    key={index}
                    variant="elevated"
                    className="bg-primary-0 rounded-full border-0 px-3 py-2"
                  >
                    <HStack space="sm" className="items-center">
                      <Image
                        source={iconAsset}
                        alt={`${mode}-icon`}
                        style={{ width: 16, height: 16 }}
                      />

                      <Text size="sm" className="font-JakartaMedium">
                        {DELIVERY_OPTIONS[mode].label}
                      </Text>
                    </HStack>
                  </Card>
                );
              })}
            </HStack>

            <HStack space="xs" className="items-start">
              <Icon size="sm" as={CalendarDaysIcon} style={{ marginTop: 2 }} />
              <Text
                size="sm"
                ellipsizeMode="tail"
                numberOfLines={2}
                className="font-JakartaMedium flex-1"
              >
                {availableDaysText}
              </Text>
            </HStack>

            <HStack space="xs" className="items-start">
              <Icon size="sm" as={MapPinIcon} style={{ marginTop: 2 }} />
              <VStack className="flex-1">
                <Text
                  size="sm"
                  ellipsizeMode="tail"
                  numberOfLines={2}
                  className="font-JakartaMedium"
                >
                  {fullAddress}
                </Text>
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
    <VStack space="sm">
      <Skeleton className="h-8 w-40" />

      <VStack space="sm">
        <HStack space="sm" className="flex-wrap">
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
