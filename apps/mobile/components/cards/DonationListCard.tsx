import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { useLocationStore } from '@/lib/stores/locationStore';
import { getMinDistance } from '@/lib/utils/getMinDistance';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { COLLECTION_MODES, PREFERRED_STORAGE_TYPES } from '@lactalink/enums';
import { Donation } from '@lactalink/types/payload-generated-types';
import { MarkKeyRequired } from '@lactalink/types/utils';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import { DropletIcon, MapPinIcon, MilkIcon, PackageIcon } from 'lucide-react-native';
import React, { ReactNode, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { AnimatedPressable } from '../animated/pressable';
import { AnimatedProgress } from '../animated/progress';
import { useTheme } from '../AppProvider/ThemeProvider';
import { SingleImageViewer } from '../ImageViewer';
import { ProfileTag } from '../ProfileTag';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const cardDefaultStyle = tva({
  base: 'rounded-xl p-0',
});

export interface DonationListCardProps extends React.ComponentProps<typeof Card> {
  data?: Donation;
  isLoading?: boolean;
  action?: ReactNode;
  onPress?: (data: Donation) => void;
  showAvatar?: boolean;
  showMinDistance?: boolean;
  hideFooter?: boolean;
  footerAction?: ReactNode;
  canViewThumbnail?: boolean;
  showProgressBar?: boolean;
}

export function DonationListCard(props: DonationListCardProps) {
  const { data, isLoading, onPress, size = 'sm', ...cardProps } = props;

  if (isLoading || data === undefined) {
    return (
      <Card {...props} size={size} className={cardDefaultStyle({ className: cardProps.className })}>
        <CardSkeleton />
      </Card>
    );
  }

  return onPress ? (
    <AnimatedPressable className="overflow-hidden rounded-xl" onPress={() => onPress(data)}>
      <Card
        {...cardProps}
        size={size}
        className={cardDefaultStyle({ className: cardProps.className })}
      >
        <CardContent {...props} data={data} />
      </Card>
    </AnimatedPressable>
  ) : (
    <Card
      {...cardProps}
      size={size}
      className={cardDefaultStyle({ className: cardProps.className })}
    >
      <CardContent {...props} data={data} />
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
  canViewThumbnail = true,
  showProgressBar,
}: MarkKeyRequired<DonationListCardProps, 'data'>) {
  const { themeColors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const locationCoords = useLocationStore((s) => s.coordinates);

  const fillColor = themeColors.primary[50];
  const strokeColor = themeColors.primary[700];

  const { details } = data;
  const { collectionMode, storageType } = details;

  const volume = data.volume;
  const percentage = Math.round((data.remainingVolume / data.volume) * 100);

  const { donor, image } = useMemo(() => {
    const imageSize = screenWidth < DEVICE_BREAKPOINTS.phone ? 'sm' : 'lg';
    const donor = extractCollection(data.donor);
    const milkSamples = extractCollection(details.milkSample);
    return { donor, image: extractOneImageData(milkSamples, imageSize) };
  }, [data.donor, details.milkSample, screenWidth]);

  const minDistance = useMemo(() => {
    const preferences = extractCollection(data?.deliveryPreferences);
    return getMinDistance(preferences, locationCoords);
  }, [locationCoords, data.deliveryPreferences]);

  return (
    <VStack className="items-start justify-start">
      <HStack space="sm" className="w-full items-stretch p-3">
        <Box
          className="aspect-square flex-shrink-0 overflow-hidden rounded-md"
          style={{ backgroundColor: fillColor }}
        >
          <SingleImageViewer disabled={!canViewThumbnail} image={image} />
        </Box>

        <VStack space="xs" className="min-w-0 flex-1 items-start">
          <HStack space="xs" className="items-center">
            <Icon size="sm" as={MilkIcon} fill={fillColor} stroke={strokeColor} />
            <Link asChild push href={`/donations/${data.id}`}>
              <Text className="font-JakartaSemiBold shrink" numberOfLines={1} ellipsizeMode="tail">
                {volume} mL
              </Text>
            </Link>
          </HStack>

          <HStack space="xs" className="items-center">
            <Icon size="sm" as={PackageIcon} fill={fillColor} stroke={strokeColor} />
            <Text size="sm" className="shrink" numberOfLines={1} ellipsizeMode="tail">
              {PREFERRED_STORAGE_TYPES[storageType].label}
            </Text>
          </HStack>

          <HStack space="xs" className="items-center">
            <Icon size="sm" as={DropletIcon} fill={fillColor} stroke={strokeColor} />
            <Text size="sm" className="shrink" numberOfLines={1} ellipsizeMode="tail">
              {COLLECTION_MODES[collectionMode || 'MANUAL'].label}
            </Text>
          </HStack>
        </VStack>

        {action}
      </HStack>

      {!hideFooter && (
        <>
          <Divider />

          {showProgressBar ? (
            <HStack space="sm" className="w-full flex-wrap items-center justify-between p-3">
              <VStack className="items-stretch">
                <AnimatedProgress
                  size="sm"
                  orientation="horizontal"
                  value={percentage}
                  className="w-48"
                />
                <Text size="xs" className="text-typography-700 text-center">
                  {data.remainingVolume} mL remaining
                </Text>
              </VStack>

              {footerAction}
            </HStack>
          ) : (
            <HStack space="sm" className="w-full flex-wrap items-stretch justify-between p-3">
              {showAvatar && (
                <ProfileTag
                  profile={donor && { value: donor, relationTo: 'individuals' }}
                  label="Donor"
                />
              )}
              {footerAction}
              {showMinDistance && minDistance && (
                <HStack space="xs" className="items-center">
                  <Icon size="sm" as={MapPinIcon} fill={fillColor} stroke={strokeColor} />
                  <Text size="xs">{minDistance.toFixed(2)} km</Text>
                </HStack>
              )}
            </HStack>
          )}
        </>
      )}
    </VStack>
  );
}

function CardSkeleton() {
  return (
    <VStack>
      <HStack space="sm" className="w-full items-stretch p-3">
        <Skeleton className="aspect-square h-auto w-auto" />

        <VStack space="xs" className="flex-1">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </VStack>

        <Skeleton className="m-auto h-9 w-20" />
      </HStack>

      <Divider />

      <HStack space="sm" className="w-full flex-wrap items-stretch justify-between p-3">
        <HStack space="sm" className="flex-1 items-center">
          <Skeleton variant="circular" className="h-8 w-8" />
          <VStack space="xs">
            <Skeleton variant="circular" className="h-3 w-24" />
            <Skeleton variant="circular" className="h-3 w-16" />
          </VStack>
        </HStack>

        <Skeleton variant="circular" className="m-auto h-4 w-16" />
      </HStack>
    </VStack>
  );
}
