import { getHexColor } from '@/lib/colors';
import { PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@/lib/constants';
import { getPriorityColor } from '@/lib/utils/getPriorityColor';
import { MarkKeyRequired, Request } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities';
import { MilkIcon, PackageIcon } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { AnimatedPressable } from '../animated/pressable';
import { AnimatedProgress } from '../animated/progress';
import { useTheme } from '../AppProvider/ThemeProvider';
import FastTimerIcon from '../icons/FastTimerIcon';
import { Image } from '../Image';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export interface RequestListCardProps extends React.ComponentProps<typeof Card> {
  data?: Request;
  isLoading?: boolean;
  action?: ReactNode;
  onPress?: (data: Request) => void;
}

export function RequestListCard(props: RequestListCardProps) {
  const { data, isLoading, onPress, ...cardProps } = props;

  if (isLoading || data === undefined) {
    return (
      <Card {...props}>
        <CardSkeleton />
      </Card>
    );
  }

  return onPress ? (
    <AnimatedPressable className="overflow-hidden rounded-2xl" onPress={() => onPress(data)}>
      <Card {...cardProps}>
        <CardContent {...props} data={data} />
      </Card>
    </AnimatedPressable>
  ) : (
    <Card {...cardProps}>
      <CardContent {...props} data={data} />
    </Card>
  );
}

function CardContent({ data, action }: MarkKeyRequired<RequestListCardProps, 'data'>) {
  const { theme } = useTheme();

  const fillColor = getHexColor(theme, 'tertiary', 50)?.toString();
  const strokeColor = getHexColor(theme, 'tertiary', 700)?.toString();

  const { details, volumeNeeded, initialVolumeNeeded, volumeFulfilled } = data;
  const { urgency, storagePreference } = details;

  const image = extractCollection(details.image);
  const imageUrl = image?.sizes?.thumbnail?.url || image?.url;

  const calculatedVolumePercentage =
    ((volumeFulfilled || 0) / (initialVolumeNeeded || volumeNeeded)) * 100;

  return (
    <VStack space="sm" className="items-start justify-start">
      <HStack space="sm" className="w-full items-stretch">
        <Box
          className="aspect-square flex-shrink-0 overflow-hidden rounded-md"
          style={{ backgroundColor: fillColor }}
        >
          {imageUrl ? (
            <Image
              recyclingKey={imageUrl}
              source={{ uri: imageUrl }}
              alt="Recipient Image"
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <Text size="xs" className="my-auto text-center">
              No Image
            </Text>
          )}
        </Box>

        <VStack space="xs" className="min-w-0 flex-1 items-start">
          <HStack space="xs" className="w-full items-center">
            <Icon size="sm" as={MilkIcon} fill={fillColor} stroke={strokeColor} />
            <Text className="font-JakartaSemiBold" numberOfLines={1} ellipsizeMode="tail">
              {volumeNeeded} mL
            </Text>
          </HStack>

          <HStack space="xs" className="w-full items-center">
            <Icon size="sm" as={PackageIcon} fill={fillColor} stroke={strokeColor} />
            <Text size="sm" numberOfLines={1} ellipsizeMode="tail">
              {PREFERRED_STORAGE_TYPES[storagePreference || 'EITHER'].label}
            </Text>
          </HStack>

          <HStack space="xs" className="w-full items-center">
            <Icon
              size="sm"
              as={FastTimerIcon}
              fill={getPriorityColor(theme, urgency)?.toString()}
            />
            <Text size="sm" style={{ color: getPriorityColor(theme, urgency) }}>
              {URGENCY_LEVELS[urgency || 'LOW'].label}
            </Text>
          </HStack>
        </VStack>

        {action && (
          <VStack space="sm" className="flex-shrink-0 items-center justify-between">
            {action}
          </VStack>
        )}
      </HStack>

      <Divider />
      <AnimatedProgress
        size="sm"
        orientation="horizontal"
        value={calculatedVolumePercentage}
        hidden={false}
      />
    </VStack>
  );
}

function CardSkeleton() {
  return (
    <HStack space="sm" className="w-full items-start">
      <Skeleton style={{ width: 92, aspectRatio: 1 }} />

      <VStack space="xs" className="flex-1 items-start">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-16" />
      </VStack>
    </HStack>
  );
}
