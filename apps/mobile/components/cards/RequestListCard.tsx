import { PREFERRED_STORAGE_TYPES } from '@/lib/constants';
import { useLocationStore } from '@/lib/stores/locationStore';
import { getMinDistance } from '@/lib/utils/getMinDistance';
import { getPriorityColor } from '@/lib/utils/getPriorityColor';
import { MarkKeyRequired, Request } from '@lactalink/types';
import { extractCollection, extractImageData, formatDate } from '@lactalink/utilities';
import { MilkIcon, PackageIcon } from 'lucide-react-native';
import React, { ReactNode, useMemo } from 'react';
import { AnimatedPressable } from '../animated/pressable';
import { AnimatedProgress } from '../animated/progress';
import { useTheme } from '../AppProvider/ThemeProvider';
import { ProfileAvatar } from '../Avatar';
import BasicLocationPin from '../icons/BasicLocationPin';
import FastTimerIcon from '../icons/FastTimerIcon';
import { SingleImageViewer } from '../ImageViewer';
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
  showAvatar?: boolean;
  showMinDistance?: boolean;
  hideFooter?: boolean;
  footerAction?: ReactNode;
  isImageViewable?: boolean;
  showProgressBar?: boolean;
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

function CardContent({
  data,
  action,
  showAvatar,
  showMinDistance,
  footerAction,
  hideFooter,
  isImageViewable = true,
  showProgressBar,
}: MarkKeyRequired<RequestListCardProps, 'data'>) {
  const { themeColors, theme } = useTheme();
  const locationCoords = useLocationStore((s) => s.coordinates);

  const fillColor = themeColors.tertiary[50];
  const strokeColor = themeColors.tertiary[700];

  const { details } = data;
  const { urgency, storagePreference, neededAt } = details;
  const requester = extractCollection(data.requester);

  const image = extractImageData(extractCollection(details.image));

  const minDistance = useMemo(() => {
    const preferences = extractCollection(data?.deliveryPreferences);
    return getMinDistance(preferences, locationCoords);
  }, [locationCoords, data.deliveryPreferences]);

  const neededAtDate = formatDate(neededAt, { shortMonth: true });

  const volume = data.initialVolumeNeeded;
  const percentage = data.fulfillmentPercentage || 0;

  return (
    <VStack space="sm" className="items-start justify-start">
      <HStack space="sm" className="w-full items-stretch">
        <Box
          className="aspect-square flex-shrink-0 overflow-hidden rounded-md"
          style={{ backgroundColor: fillColor }}
        >
          <SingleImageViewer disabled={!isImageViewable} image={image} />
        </Box>

        <VStack space="xs" className="min-w-0 flex-1 items-start">
          <HStack space="xs" className="w-full items-center">
            <Icon size="sm" as={MilkIcon} fill={fillColor} stroke={strokeColor} />
            <Text className="font-JakartaSemiBold" numberOfLines={1} ellipsizeMode="tail">
              {volume} mL
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
              {neededAtDate}
            </Text>
          </HStack>
        </VStack>

        {action}
      </HStack>

      {!hideFooter && (
        <>
          <Divider />

          {showProgressBar ? (
            <HStack space="sm" className="w-full items-center justify-between">
              <VStack className="items-stretch">
                <AnimatedProgress
                  size="sm"
                  orientation="horizontal"
                  value={percentage}
                  className="w-48"
                />
                <Text size="xs" className="text-typography-700 text-center">
                  {data.volumeFulfilled} mL fulfilled
                </Text>
              </VStack>

              {footerAction}
            </HStack>
          ) : (
            <HStack space="sm" className="w-full items-stretch justify-between">
              {showAvatar && (
                <HStack space="sm" className="items-center">
                  <ProfileAvatar size="sm" profile={requester} />
                  <VStack className="shrink">
                    <Text
                      size="xs"
                      className="font-JakartaMedium"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {requester?.displayName}
                    </Text>
                    <Text size="xs" className="text-typography-700">
                      Requester
                    </Text>
                  </VStack>
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
          )}
        </>
      )}
    </VStack>
  );
}

function CardSkeleton() {
  return (
    <VStack space="sm">
      <HStack space="sm" className="w-full items-stretch">
        <Skeleton className="aspect-square h-auto w-auto" />

        <VStack space="xs" className="flex-1">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </VStack>

        <Skeleton className="m-auto h-9 w-20" />
      </HStack>

      <Divider />

      <HStack space="sm" className="w-full flex-wrap items-stretch justify-between">
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
