import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { ProfileAvatar } from '@/components/Avatar';
import { BasicBadge } from '@/components/badges';
import { DynamicStack, DynamicStackProps } from '@/components/ui/DynamicStack';
import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { getUrgencyAction } from '@/lib/utils/getUrgencyAction';
import { PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { Request } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useRequest } from '../../hooks/queries';

type CardContentProps = Pick<DynamicStackProps, 'orientation'> &
  Pick<CardProps, 'variant'> & {
    data: Request;
  };

interface RequestCardProps extends Omit<CardContentProps, 'data'> {
  data?: string | Request;
  isLoading?: boolean;
}

export function RequestCardSkeleton({
  orientation = 'horizontal',
}: Pick<CardContentProps, 'orientation'>) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <Skeleton
      variant="rounded"
      className="rounded-2xl"
      style={isHorizontal ? { height: 96, maxWidth: 420 } : { height: 180, maxWidth: 420 }}
    />
  );
}

export default function RequestCard({
  data: dataProp,
  isLoading: isLoadingProp,
  ...props
}: RequestCardProps) {
  const { data: donationData, isLoading: isDataLoading } = useRequest(dataProp);

  const isLoading = isLoadingProp || isDataLoading;

  if (isLoading || !donationData) {
    return <RequestCardSkeleton orientation={props.orientation} />;
  }

  return <CardContent {...props} data={donationData} />;
}

function CardContent({ data, orientation = 'horizontal', variant = 'elevated' }: CardContentProps) {
  const { width: screenWidth } = useWindowDimensions();
  const isHorizontal = orientation === 'horizontal';
  const isVertical = orientation === 'vertical';

  const image = useMemo(() => {
    const imageSize = screenWidth < DEVICE_BREAKPOINTS.phone ? 'sm' : 'lg';
    const milkSamples = extractCollection(data.details.image);
    return extractOneImageData(milkSamples, imageSize);
  }, [data.details.image, screenWidth]);

  const volume = data.volumeNeeded;
  const urgency = data.details.urgency;
  const preferredStorage = data.details.storagePreference ?? PREFERRED_STORAGE_TYPES.EITHER.value;

  return (
    <Card variant={variant} className="items-stretch p-0" style={{ maxWidth: 360 }}>
      <DynamicStack orientation={orientation}>
        <Box
          className="relative border-tertiary-500 bg-tertiary-50"
          style={
            isHorizontal
              ? { width: 96, aspectRatio: 1, borderRightWidth: 4 }
              : { height: 164, width: '100%', borderBottomWidth: 4 }
          }
        >
          <SingleImageViewer image={image} />
          {isVertical && (
            <Box className="absolute" style={{ bottom: 8, right: 8 }}>
              <ProfileAvatar
                size="sm"
                profile={{ relationTo: 'individuals', value: data.requester }}
              />
            </Box>
          )}
        </Box>

        <HStack space="sm" className="flex-1 px-4 py-2">
          <VStack className="flex-1 items-start justify-center">
            <Text size="xl" className="font-JakartaExtraBold" numberOfLines={1}>
              {displayVolume(volume)}
            </Text>

            <Text
              size="sm"
              className="mb-1 font-JakartaMedium text-typography-700"
              numberOfLines={isHorizontal ? 1 : 2}
            >
              {PREFERRED_STORAGE_TYPES[preferredStorage].label}
            </Text>

            {isHorizontal && (
              <BasicBadge
                size="lg"
                action={getUrgencyAction(urgency)}
                text={URGENCY_LEVELS[urgency].label}
              />
            )}
          </VStack>

          <Box className={isVertical ? 'self-center' : 'self-end'}>
            {isVertical ? (
              <BasicBadge
                size="lg"
                action={getUrgencyAction(urgency)}
                text={URGENCY_LEVELS[urgency].label}
              />
            ) : (
              <ProfileAvatar
                size="sm"
                profile={{ relationTo: 'individuals', value: data.requester }}
              />
            )}
          </Box>
        </HStack>
      </DynamicStack>
    </Card>
  );
}
