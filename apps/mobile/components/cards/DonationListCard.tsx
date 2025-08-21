import { COLLECTION_MODES, DEVICE_BREAKPOINTS, PREFERRED_STORAGE_TYPES } from '@/lib/constants';
import { useLocationStore } from '@/lib/stores/locationStore';
import { getMinDistance } from '@/lib/utils/getMinDistance';
import { Donation, MarkKeyRequired } from '@lactalink/types';
import { extractCollection, extractOneImageData } from '@lactalink/utilities';
import { DropletIcon, MilkIcon, PackageIcon } from 'lucide-react-native';
import React, { ReactNode, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { AnimatedPressable } from '../animated/pressable';
import { useTheme } from '../AppProvider/ThemeProvider';
import { ProfileAvatar } from '../Avatar';
import BasicLocationPin from '../icons/BasicLocationPin';
import { SingleImageViewer } from '../ImageViewer';
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
  showAvatar?: boolean;
  showMinDistance?: boolean;
  hideFooter?: boolean;
  footerAction?: ReactNode;
  isImageViewable?: boolean;
}

export function DonationListCard(props: DonationListCardProps) {
  const { data, isLoading, onPress, showAvatar, showMinDistance, ...cardProps } = props;

  if (isLoading || data === undefined) {
    return (
      <Card {...cardProps}>
        <CardSkeleton />
      </Card>
    );
  }

  return onPress ? (
    <AnimatedPressable className="overflow-hidden rounded-2xl" onPress={() => onPress(data)}>
      <Card {...cardProps}>
        <CardContent
          {...props}
          data={data}
          showAvatar={showAvatar}
          showMinDistance={showMinDistance}
        />
      </Card>
    </AnimatedPressable>
  ) : (
    <Card {...cardProps}>
      <CardContent
        {...props}
        data={data}
        showAvatar={showAvatar}
        showMinDistance={showMinDistance}
      />
    </Card>
  );
}

function CardContent({
  data,
  action,
  showAvatar,
  footerAction,
  hideFooter,
  showMinDistance,
  isImageViewable = true,
}: MarkKeyRequired<DonationListCardProps, 'data'>) {
  const { themeColors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const locationCoords = useLocationStore((s) => s.coordinates);

  const fillColor = themeColors.primary[50];
  const strokeColor = themeColors.primary[700];

  const { details, remainingVolume } = data;
  const { collectionMode, storageType } = details;

  const {
    uri: imageUrl,
    alt,
    blurHash,
    donor,
  } = useMemo(() => {
    const imageSize = screenWidth < DEVICE_BREAKPOINTS.phone ? 'sm' : 'lg';
    const donor = extractCollection(data.donor);
    const milkSamples = extractCollection(details.milkSample);
    return { donor, ...extractOneImageData(milkSamples, imageSize) };
  }, [data.donor, details.milkSample, screenWidth]);

  const minDistance = useMemo(() => {
    const preferences = extractCollection(data?.deliveryPreferences);
    return getMinDistance(preferences, locationCoords);
  }, [locationCoords, data.deliveryPreferences]);

  return (
    <VStack space="sm" className="items-start justify-start">
      <HStack space="sm" className="w-full items-stretch">
        <Box
          className="aspect-square flex-shrink-0 overflow-hidden rounded-md"
          style={{ backgroundColor: fillColor }}
        >
          {imageUrl ? (
            <SingleImageViewer
              disabled={!isImageViewable}
              image={{ uri: imageUrl, blurHash, alt }}
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
          <VStack space="sm" className="flex-shrink-0 items-center justify-center">
            {action}
          </VStack>
        )}
      </HStack>

      {!hideFooter && (
        <>
          <Divider />

          <HStack space="sm" className="w-full items-stretch justify-between">
            {showAvatar && (
              <HStack space="sm" className="items-center">
                <ProfileAvatar size="sm" profile={donor} />
                <Text size="xs" className="font-JakartaMedium text-typography-800">
                  {donor?.displayName}
                </Text>
              </HStack>
            )}
            {footerAction}
            {showMinDistance && minDistance && (
              <HStack space="xs" className="items-center">
                <Icon as={BasicLocationPin} fill={themeColors.primary[500]} />
                <Text size="xs">{minDistance.toFixed(2)} km</Text>
              </HStack>
            )}
          </HStack>
        </>
      )}
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
