import { getHexColor } from '@/lib/colors';
import { PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@/lib/constants';
import { getPriorityColor } from '@/lib/utils/getPriorityColor';
import { Image as ImageType, Request } from '@lactalink/types';
import { MilkIcon, PackageIcon } from 'lucide-react-native';
import React, { ReactNode } from 'react';
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
}

export function RequestListCard({ data, isLoading, action, ...props }: RequestListCardProps) {
  const { theme } = useTheme();

  const fillColor = getHexColor(theme, 'primary', 50)?.toString();
  const strokeColor = getHexColor(theme, 'primary', 700)?.toString();

  if (isLoading && !data) {
    return (
      <Card {...props}>
        <CardSkeleton />
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { details, volumeNeeded, initialVolumeNeeded, volumeFulfilled } = data;
  const { urgency, storagePreference } = details;

  const image = details.image as ImageType | null;
  const imageUrl = image?.sizes?.thumbnail?.url || image?.url;

  const calculatedVolumePercentage =
    ((volumeFulfilled || 0) / (initialVolumeNeeded || volumeNeeded)) * 100;

  return (
    <Card {...props}>
      <VStack space="sm" className="items-start justify-start">
        <HStack space="sm" className="w-full items-stretch">
          <Box className="bg-primary-50 aspect-square flex-shrink-0 overflow-hidden rounded-md">
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
    </Card>
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
