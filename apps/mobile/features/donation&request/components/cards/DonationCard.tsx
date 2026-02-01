import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { ProfileAvatar } from '@/components/Avatar';
import DonationRequestStatusBadge from '@/components/badges/DonationRequestStatusBadge';
import { DynamicStack, DynamicStackProps } from '@/components/ui/DynamicStack';
import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { STORAGE_TYPES } from '@lactalink/enums';
import { Donation } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useDonation } from '../../hooks/queries';

type CardContentProps = Pick<DynamicStackProps, 'orientation'> &
  Pick<CardProps, 'variant'> & {
    data: Donation;
  };

interface DonationCardProps extends Omit<CardContentProps, 'data'> {
  data?: string | Donation;
}

export default function DonationCard({ data: dataProp, ...props }: DonationCardProps) {
  const { data: data, isLoading } = useDonation(dataProp!);

  if (isLoading || !data) {
    return <CardSkeleton orientation={props.orientation} />;
  }

  return <CardContent {...props} data={data} />;
}

function CardContent({ data, orientation = 'horizontal', variant = 'elevated' }: CardContentProps) {
  const { width: screenWidth } = useWindowDimensions();
  const isHorizontal = orientation === 'horizontal';
  const isVertical = orientation === 'vertical';

  const image = useMemo(() => {
    const imageSize = screenWidth < DEVICE_BREAKPOINTS.phone ? 'sm' : 'lg';
    const milkSamples = extractCollection(data?.details?.milkSample);
    return extractOneImageData(milkSamples, imageSize);
  }, [data.details.milkSample, screenWidth]);

  const volume = data.volume;
  const storage = data.details.storageType;

  return (
    <Card variant={variant} className="items-stretch p-0" style={{ maxWidth: 360 }}>
      <DynamicStack orientation={orientation}>
        <Box
          className="relative border-primary-500 bg-primary-50"
          style={
            isHorizontal
              ? { width: 96, aspectRatio: 1, borderRightWidth: 4 }
              : { height: 164, width: '100%', borderBottomWidth: 4 }
          }
        >
          <SingleImageViewer image={image} disabled />
          {isVertical && (
            <Box className="absolute" style={{ bottom: 8, right: 8 }}>
              <ProfileAvatar size="sm" profile={{ relationTo: 'individuals', value: data.donor }} />
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
              {STORAGE_TYPES[storage].label}
            </Text>
            {isHorizontal && <DonationRequestStatusBadge status={data.status} />}
          </VStack>

          <Box className={isVertical ? 'self-center' : 'self-end'}>
            {isVertical ? (
              <DonationRequestStatusBadge status={data.status} size="md" />
            ) : (
              <ProfileAvatar size="sm" profile={{ relationTo: 'individuals', value: data.donor }} />
            )}
          </Box>
        </HStack>
      </DynamicStack>
    </Card>
  );
}

function CardSkeleton({ orientation = 'horizontal' }: Pick<CardContentProps, 'orientation'>) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <Skeleton
      variant="rounded"
      className="rounded-2xl"
      style={isHorizontal ? { width: 96, aspectRatio: 1 } : { height: 180, width: '100%' }}
    />
  );
}
