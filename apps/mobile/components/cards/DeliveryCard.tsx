import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliverySchema } from '@lactalink/form-schemas';
import { DeliveryDetail } from '@lactalink/types/payload-generated-types';
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
  base: 'flex-col items-stretch gap-2 p-4',
});

interface DeliveryCardProps extends CardProps {
  data: DeliverySchema | DeliveryDetail | undefined;
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

  if (!data) return null;

  const deliveryMethod = isDeliverySchema(data) ? data.mode : data.method;

  const label = DELIVERY_OPTIONS[deliveryMethod].label;
  const iconSource = getDeliveryPreferenceIcon(deliveryMethod);
  const time = formatLocaleTime(isDeliverySchema(data) ? data.time : data.scheduledAt);
  const date = formatDate(isDeliverySchema(data) ? data.date : data.scheduledAt);
  const address = extractCollection(data.address)?.displayName || 'Unknown Address';
  const instructions = isDeliverySchema(data) ? data.note : data.notes;

  return (
    <Card {...props} variant={variant} className={cardStyle({ className })}>
      <HStack space="sm" className="items-center">
        <Text className="flex-1 font-JakartaSemiBold text-primary-500">{label}</Text>

        <Box className="rounded-full border border-primary-500 p-1">
          <Image
            source={iconSource}
            alt={`${deliveryMethod || 'Unknown'}-icon`}
            style={{ width: 18, height: 18 }}
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
          <Text size="sm" className="shrink" numberOfLines={2}>
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
