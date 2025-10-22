import { Card } from '@/components/ui/card';
import { VStack } from '@/components/ui/vstack';
import { DELIVERY_OPTIONS, ShortDays } from '@lactalink/enums';
import { CalendarDaysIcon, MapPinIcon } from 'lucide-react-native';

import { useFetchById } from '@/hooks/collections/useFetchById';
import { MapPageSearchParams } from '@/lib/types';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DeliveryPreferenceCreateSchema, DeliveryPreferenceSchema } from '@lactalink/form-schemas';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID, extractObject } from '@lactalink/utilities/extractors';
import { formatDaysToText } from '@lactalink/utilities/formatters';
import { pointToLatLng } from '@lactalink/utilities/geo-utils';
import { isString } from '@lactalink/utilities/type-guards';
import { Link, useRouter } from 'expo-router';
import { ComponentProps, ReactNode, useMemo } from 'react';
import { GestureResponderEvent } from 'react-native';
import { BasicBadge } from '../badges/BasicBadge';
import { Image } from '../Image';
import { ThumbnailMap } from '../map/ThumbnailMap';
import { Box } from '../ui/box';
import { Button, ButtonText } from '../ui/button';
import { Divider } from '../ui/divider';
import GradientBackground from '../ui/gradient-bg';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { BasicLocationPin } from '../ui/icon/custom';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';

export interface DeliveryPreferenceCardProps extends CardProps {
  appearance?: 'list-item' | 'compact';
}
export function DeliveryPreferenceCard({
  appearance = 'list-item',
  ...props
}: DeliveryPreferenceCardProps) {
  switch (appearance) {
    case 'compact':
      return <CompactCard {...props} />;

    default:
      return <ListCard {...props} />;
  }
}

export function DeliveryPreferenceCardSkeleton({
  appearance = 'list-item',
}: Pick<DeliveryPreferenceCardProps, 'appearance'>) {
  switch (appearance) {
    case 'compact':
      return (
        <>
          <Skeleton variant="sharp" className="h-32 w-full" />
          <HStack space="xs" className="w-full items-start p-2">
            <Skeleton variant="circular" className="h-4 w-4" />
            <VStack className="flex-1">
              <Skeleton variant="circular" className="mb-1 h-2 w-full" />
              <Skeleton variant="circular" className="mb-1 h-2 w-full" />
              <Skeleton variant="circular" className="mb-1 h-2 w-2/3" />
            </VStack>
          </HStack>
        </>
      );

    default:
      return (
        <VStack space="sm">
          <Skeleton className="h-8 w-40" />

          <VStack space="sm">
            <HStack space="sm" className="flex-wrap">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </HStack>

            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4 w-1/3" />
          </VStack>
        </VStack>
      );
  }
}

interface CardProps extends ComponentProps<typeof Card> {
  preference:
    | string
    | DeliveryPreference
    | DeliveryPreferenceSchema
    | DeliveryPreferenceCreateSchema;
  isLoading?: boolean;
  action?: ReactNode;
  hideIconLabels?: boolean;
}

function ListCard({
  preference,
  isLoading: isLoadingProp,
  action,
  variant = 'filled',
  size = 'md',
  hideIconLabels = false,
  ...props
}: CardProps) {
  const cardStyle = tva({
    base: 'relative w-full',
  });

  const textSize = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'xs';
      case 'md':
        return 'sm';
      case 'lg':
        return 'md';
      default:
        return size || 'sm';
    }
  }, [size]);

  const prefID = isString(preference)
    ? preference
    : ('id' in preference && extractID(preference)) || '';

  const dpQuery = useFetchById(isString(preference), {
    collection: 'delivery-preferences',
    id: prefID,
    select: { name: true, address: true, availableDays: true, preferredMode: true },
    populate: { addresses: { name: true, displayName: true, coordinates: true, isDefault: true } },
    depth: 3,
  });

  const data = extractObject(preference) || dpQuery.data;

  const { preferredMode, availableDays, name } = data || {};

  const addressQuery = useFetchById(isString(data?.address), {
    collection: 'addresses',
    id: extractID(data?.address) || '',
    select: { name: true, displayName: true, coordinates: true, isDefault: true },
    depth: 0,
  });

  const isLoading = isLoadingProp || dpQuery.isLoading || addressQuery.isLoading;

  const preferenceName = name || `Delivery Preference`;
  const availableDaysText = formatDaysToText(availableDays || [], { short: true });

  const address = extractCollection(data?.address) || addressQuery.data;
  const fullAddress = address?.displayName || 'Unknown Address';

  if (isLoading) {
    return (
      <Card {...props} variant={variant} className={cardStyle({ className: props.className })}>
        <DeliveryPreferenceCardSkeleton appearance={'list-item'} />
      </Card>
    );
  }

  return (
    <Card {...props} variant={variant} className={cardStyle({ className: props.className })}>
      <VStack space="sm">
        <HStack space="md">
          <Link asChild href={`/delivery-preferences/${prefID}`}>
            <Button
              size={size}
              disablePressAnimation
              variant="link"
              className="h-fit w-fit self-start p-0"
            >
              <ButtonText underlineOnPress>{preferenceName}</ButtonText>
            </Button>
          </Link>
          {action}
        </HStack>

        <HStack space="xs" className="items-start">
          <Icon
            size="sm"
            as={CalendarDaysIcon}
            className="fill-primary-50 text-primary-500"
            style={{ marginTop: 2 }}
          />
          <Text
            size={textSize}
            ellipsizeMode="tail"
            numberOfLines={2}
            className="font-JakartaMedium flex-1"
          >
            {availableDaysText}
          </Text>
        </HStack>

        <HStack space="xs" className="items-start">
          <Icon
            size="sm"
            as={MapPinIcon}
            className="fill-primary-50 text-primary-500"
            style={{ marginTop: 2 }}
          />
          <VStack className="flex-1">
            <Text
              size={textSize}
              ellipsizeMode="tail"
              numberOfLines={2}
              className="font-JakartaMedium"
            >
              {fullAddress}
            </Text>
          </VStack>
        </HStack>

        <Divider />

        <HStack space="md" className="mt-1 flex-wrap items-center">
          {preferredMode?.map((mode, index) => {
            const iconAsset = getDeliveryPreferenceIcon(mode);
            return (
              <HStack key={index} space="xs" className="items-center">
                <Box className="border-primary-500 rounded-full border p-1">
                  <Image
                    source={iconAsset}
                    alt={`${mode}-icon`}
                    style={{ width: 16, height: 16 }}
                  />
                </Box>

                {!hideIconLabels && (
                  <Text size={textSize} className="font-JakartaMedium">
                    {DELIVERY_OPTIONS[mode].label}
                  </Text>
                )}
              </HStack>
            );
          })}
        </HStack>
      </VStack>
    </Card>
  );
}

function CompactCard({
  preference,
  isLoading: isLoadingProp,
  variant = 'filled',
  ...props
}: CardProps) {
  const cardStyle = tva({
    base: 'w-40 flex-col items-stretch justify-start p-0',
  });

  const router = useRouter();

  const prefID = isString(preference)
    ? preference
    : ('id' in preference && extractID(preference)) || '';

  const dpQuery = useFetchById(isString(preference), {
    collection: 'delivery-preferences',
    id: prefID,
    select: { name: true, address: true, availableDays: true, preferredMode: true },
    populate: { addresses: { name: true, displayName: true, coordinates: true, isDefault: true } },
    depth: 3,
  });

  const data = extractCollection(preference) || dpQuery.data;

  const addressQuery = useFetchById(isString(data?.address), {
    collection: 'addresses',
    id: extractID(data?.address) || '',
    select: { name: true, displayName: true, coordinates: true, isDefault: true },
    depth: 0,
  });

  const isLoading = isLoadingProp || dpQuery.isLoading || addressQuery.isLoading;

  const address = extractCollection(data?.address) || addressQuery.data;
  const fullAddress = address?.displayName || 'No address';
  const center = pointToLatLng(address?.coordinates);

  const { preferredMode, availableDays } = data || {};

  function handlePress(e: GestureResponderEvent) {
    e.stopPropagation();
    const params: MapPageSearchParams = {
      adr: extractID(address),
      lat: String(center.latitude),
      lng: String(center.longitude),
    };
    router.push({ pathname: '/map/explore', params });
  }

  return (
    <Card {...props} variant={variant} className={cardStyle({ className: props.className })}>
      {isLoading ? (
        <DeliveryPreferenceCardSkeleton appearance="compact" />
      ) : (
        <>
          <Box className="relative">
            <ThumbnailMap center={center} />
            <GradientBackground
              pointerEvents="none"
              colors={['transparent', 'black']}
              style={{ opacity: 0.35 }}
            />

            <HStack space="xs" className="absolute right-0 top-0 items-center p-1">
              {preferredMode?.map((mode, index) => {
                const iconAsset = getDeliveryPreferenceIcon(mode);
                return (
                  <Card key={index} variant="elevated" className="rounded-full border-0 p-2">
                    <Image
                      source={iconAsset}
                      alt={`${mode}-icon`}
                      style={{ width: 16, height: 16 }}
                    />
                  </Card>
                );
              })}
            </HStack>

            <HStack space="xs" className="absolute inset-x-0 bottom-0 flex-wrap p-1">
              {availableDays?.map((day, index) => {
                const label = ShortDays[day];
                return <BasicBadge key={index} action="primary" size="xs" text={label} />;
              })}
            </HStack>
          </Box>

          <HStack space="xs" className="items-start p-2">
            <Icon size="sm" as={BasicLocationPin} className="fill-primary-500" />
            <Text size="xs" className="flex-1" numberOfLines={3} ellipsizeMode="tail">
              {fullAddress}
            </Text>
          </HStack>
        </>
      )}
    </Card>
  );
}
