import { getHexColor } from '@/lib/colors';
import { COLLECTION_MODES, PREFERRED_STORAGE_TYPES } from '@/lib/constants';
import { Donation, MarkKeyRequired } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities';
import { DropletIcon, MilkIcon, PackageIcon } from 'lucide-react-native';
import React, { ReactNode } from 'react';
import { AnimatedPressable } from '../animated/pressable';
import { AnimatedProgress } from '../animated/progress';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Image } from '../Image';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export interface DonationListCardProps extends React.ComponentProps<typeof Card> {
  data?: Donation;
  isLoading?: boolean;
  action?: ReactNode;
  onPress?: (data: Donation) => void;
}

export function DonationListCard(props: DonationListCardProps) {
  const { data, isLoading, onPress, ...cardProps } = props;

  if (isLoading || data === undefined) {
    return (
      <Card {...cardProps}>
        <CardSkeleton />
      </Card>
    );
  }

  return onPress ? (
    <AnimatedPressable onPress={() => onPress(data)}>
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

function CardContent({ data, action }: MarkKeyRequired<DonationListCardProps, 'data'>) {
  const { theme } = useTheme();

  const fillColor = getHexColor(theme, 'primary', 50)?.toString();
  const strokeColor = getHexColor(theme, 'primary', 700)?.toString();

  const { details, volume, remainingVolume } = data;
  const { collectionMode, storageType } = details;

  const milkSamples = extractCollection(details.milkSample);
  const image = milkSamples && milkSamples.length ? milkSamples[0] : null;
  const imageUrl = image?.sizes?.thumbnail?.url || image?.url;
  const availableVolumePercentage = (remainingVolume || 0 / (volume || 0)) * 100;

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
              alt="Milk sample"
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
            <Text className="font-JakartaSemiBold flex-1" numberOfLines={1} ellipsizeMode="tail">
              {remainingVolume} mL
            </Text>
          </HStack>

          <HStack space="xs" className="w-full items-center">
            <Icon size="sm" as={PackageIcon} fill={fillColor} stroke={strokeColor} />
            <Text size="sm" className="flex-1" numberOfLines={1} ellipsizeMode="tail">
              {PREFERRED_STORAGE_TYPES[storageType].label}
            </Text>
          </HStack>

          <HStack space="xs" className="w-full items-center">
            <Icon size="sm" as={DropletIcon} fill={fillColor} stroke={strokeColor} />
            <Text size="sm" className="flex-1" numberOfLines={1} ellipsizeMode="tail">
              {COLLECTION_MODES[collectionMode || 'MANUAL'].label}
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
        value={availableVolumePercentage}
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
