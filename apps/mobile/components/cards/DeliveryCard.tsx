import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliverySchema } from '@lactalink/form-schemas';
import { ConfirmedDelivery, Delivery } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { CalendarDaysIcon, ClockIcon, MapPinIcon } from 'lucide-react-native';
import React from 'react';
import { Image } from '../Image';
import { Box } from '../ui/box';
import { Card, CardProps } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';

const cardStyle = tva({
  base: 'flex-col gap-2 p-4',
});

interface DeliveryCardProps extends CardProps {
  data: DeliverySchema | (ConfirmedDelivery & Pick<Delivery, 'instructions'>) | undefined;
  isLoading?: boolean;
}

export function DeliveryCard({
  data,
  isLoading,
  className,
  variant = 'filled',
  ...props
}: DeliveryCardProps) {
  if (isLoading) {
    return (
      <Card {...props} variant={variant} className={cardStyle({ className })}>
        <HStack space="sm" className="items-center justify-between">
          <Skeleton variant="rounded" className="h-6 w-28" />
          <Skeleton variant="circular" className="h-8 w-8" />
        </HStack>
        <Skeleton variant="rounded" className="h-4 w-40" />
        <Skeleton variant="rounded" className="h-4 w-40" />
        <Skeleton variant="rounded" className="h-4" />
      </Card>
    );
  }

  const label = data ? DELIVERY_OPTIONS[data.mode]?.label || 'Unknown' : 'No Data';
  const iconSource = data ? getDeliveryPreferenceIcon(data.mode) : null;
  const time = data ? formatLocaleTime(isDeliverySchema(data) ? data.time : data.datetime) : '-';
  const date = data ? formatDate(isDeliverySchema(data) ? data.date : data.datetime) : '-';
  const address = data ? extractCollection(data.address)?.displayName || 'Unknown Address' : '-';
  const instructions = data && (isDeliverySchema(data) ? data.note : data.instructions);

  return (
    <Card {...props} variant={variant} className={cardStyle({ className })}>
      <HStack space="sm" className="items-center">
        <Text className="font-JakartaSemiBold text-primary-500 flex-1">{label}</Text>

        <Box className="border-primary-500 rounded-full border p-1">
          <Image
            source={iconSource}
            alt={`${data?.mode || 'Unknown'}-icon`}
            style={{ width: 16, height: 16 }}
          />
        </Box>
      </HStack>

      <HStack space="sm" className="items-start">
        <Icon size="sm" as={ClockIcon} className="text-primary-500" />
        <Text size="sm" numberOfLines={2} className="flex-1">
          {time}
        </Text>
      </HStack>

      <HStack space="sm" className="items-start">
        <Icon size="sm" as={CalendarDaysIcon} className="text-primary-500" />
        <Text size="sm" numberOfLines={2} className="flex-1">
          {date}
        </Text>
      </HStack>

      <HStack space="sm" className="items-start">
        <Icon size="sm" as={MapPinIcon} className="text-primary-500" />
        <Text size="sm" numberOfLines={2} className="flex-1">
          {address}
        </Text>
      </HStack>

      {instructions && (
        <>
          <Divider />
          <Text size="sm" className="flex-1" numberOfLines={3}>
            {instructions}
          </Text>
        </>
      )}
    </Card>
  );
}

function isDeliverySchema(data: DeliveryCardProps['data']): data is DeliverySchema {
  if (!data) return false;
  return 'note' in data || 'time' in data || 'date' in data;
}
