import { useLocationStore } from '@/lib/stores/locationStore';
import { getMinDistance } from '@/lib/utils/getMinDistance';
import { getUrgencyAction } from '@/lib/utils/getUrgencyAction';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { Request } from '@lactalink/types/payload-generated-types';
import { MarkKeyRequired } from '@lactalink/types/utils';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractImageData } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { MapPinIcon, PackageIcon } from 'lucide-react-native';
import React, { ReactNode, useMemo } from 'react';
import { AnimatedPressable } from '../animated/pressable';
import { AnimatedProgress } from '../animated/progress';
import { useTheme } from '../AppProvider/ThemeProvider';
import { BasicBadge } from '../badges';
import { SingleImageViewer } from '../ImageViewer';
import { ProfileTag } from '../ProfileTag';
import { Button, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Pressable } from '../ui/pressable';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const cardDefaultStyle = tva({
  base: 'rounded-xl p-0',
});

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
  disableLinks?: boolean;
}

export function RequestListCard(props: RequestListCardProps) {
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
  showMinDistance,
  footerAction,
  hideFooter,
  showProgressBar,
  disableLinks = false,
}: MarkKeyRequired<RequestListCardProps, 'data'>) {
  const router = useRouter();
  const { themeColors } = useTheme();
  const locationCoords = useLocationStore((s) => s.coordinates);

  const fillColor = themeColors.tertiary[50];
  const strokeColor = themeColors.tertiary[700];

  const { details } = data;
  const { urgency, storagePreference } = details;
  const requester = extractCollection(data.requester);

  const image = extractImageData(extractCollection(details.image));

  const minDistance = useMemo(() => {
    const preferences = extractCollection(data?.deliveryPreferences);
    return getMinDistance(preferences, locationCoords);
  }, [locationCoords, data.deliveryPreferences]);

  const volume = data.initialVolumeNeeded;
  const percentage = data.fulfillmentPercentage || 0;

  function viewMore() {
    router.push(`/requests/${data.id}`);
  }

  return (
    <VStack className="items-start justify-start">
      <HStack space="sm" className="w-full items-stretch p-3">
        <Pressable
          className="aspect-square flex-shrink-0 overflow-hidden rounded-md"
          style={{ backgroundColor: fillColor }}
          onPress={!disableLinks ? viewMore : undefined}
          pointerEvents={!disableLinks ? 'auto' : 'none'}
        >
          <SingleImageViewer disabled image={image} />
        </Pressable>

        <VStack space="xs" className="flex-1 items-start">
          <Button
            disablePressAnimation
            variant="link"
            action="default"
            className="h-fit w-fit p-0"
            onPress={viewMore}
            pointerEvents={!disableLinks ? 'auto' : 'none'}
          >
            <ButtonText
              className="font-JakartaBold"
              underlineOnPress
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayVolume(volume)}
            </ButtonText>
          </Button>

          <HStack space="xs" className="items-center">
            <Icon size="sm" as={PackageIcon} fill={fillColor} stroke={strokeColor} />
            <Text
              size="sm"
              className="flex-1 font-JakartaMedium"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {PREFERRED_STORAGE_TYPES[storagePreference || 'EITHER'].label}
            </Text>
          </HStack>

          <BasicBadge
            size="sm"
            text={URGENCY_LEVELS[urgency].label}
            action={getUrgencyAction(urgency)}
          />
        </VStack>

        {action}
      </HStack>

      {!hideFooter && (
        <>
          <Divider />

          {showProgressBar ? (
            <HStack space="sm" className="w-full items-center justify-between p-3">
              <VStack className="items-stretch">
                <AnimatedProgress
                  size="sm"
                  orientation="horizontal"
                  value={percentage}
                  className="w-48"
                />
                <Text size="xs" className="text-center text-typography-700">
                  {data.volumeFulfilled} mL fulfilled
                </Text>
              </VStack>

              {footerAction}
            </HStack>
          ) : (
            <HStack space="sm" className="w-full items-stretch justify-between p-3">
              {showAvatar && (
                <ProfileTag
                  profile={requester && { value: requester, relationTo: 'individuals' }}
                  label="Requester"
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
