import TruncatedText from '@/components/TruncatedText';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text, TextProps } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAddress } from '@/features/address/hooks/queries';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { formatDaysToText } from '@lactalink/utilities/formatters';
import { CalendarDaysIcon, MapPinIcon } from 'lucide-react-native';
import React from 'react';
import DeliveryModeIcons from './DeliveryModeIcons';

const cardStyle = tva({
  base: 'gap-2 p-4',
});

interface DPListCardProps extends CardProps {
  data: DeliveryPreference;
  action?: React.ReactNode;
}

function DPListCard({ data, size, action, className, ...cardProps }: DPListCardProps) {
  const { data: addressDoc } = useAddress(data.address);

  const preferenceName = data.name || `Delivery Preference`;
  const availableDaysText = formatDaysToText(data.availableDays, { short: true });
  const fullAddress = addressDoc?.displayName || 'Unknown Address';
  const preferredModes = data.preferredMode;

  const textSize = getTextSize(size || 'md');

  return (
    <Card {...cardProps} className={cardStyle({ className: className })}>
      <HStack space="md" className="items-center">
        <Text size={size} bold className="flex-1">
          {preferenceName}
        </Text>
        {action}
      </HStack>

      <HStack space="xs">
        <Icon size="md" as={CalendarDaysIcon} />
        <TruncatedText
          size={textSize}
          initialLines={2}
          containerClassName="flex-1"
          className="font-JakartaMedium"
        >
          {availableDaysText}
        </TruncatedText>
      </HStack>

      <HStack space="xs">
        <Icon size="md" as={MapPinIcon} />
        <TruncatedText
          size={textSize}
          initialLines={2}
          containerClassName="flex-1"
          className="font-JakartaMedium"
        >
          {fullAddress}
        </TruncatedText>
      </HStack>

      <DeliveryModeIcons space="sm" orientation="horizontal" modes={preferredModes} size="2xs" />
    </Card>
  );
}

function DPListCardSkeleton() {
  return (
    <Card className="gap-2 p-4">
      <Skeleton className="h-8 w-40" />

      <VStack space="sm">
        <Skeleton variant="sharp" className="h-4" />
        <Skeleton variant="sharp" className="h-4" />
        <Skeleton variant="sharp" className="h-4 w-1/3" />
        <HStack space="sm">
          <Skeleton variant="circular" className="h-10 w-10" />
          <Skeleton variant="circular" className="h-10 w-10" />
          <Skeleton variant="circular" className="h-10 w-10" />
        </HStack>
      </VStack>
    </Card>
  );
}

function getTextSize(size: NonNullable<CardProps['size']>): NonNullable<TextProps['size']> {
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
}

export default Object.assign(DPListCard, {
  Skeleton: DPListCardSkeleton,
});
