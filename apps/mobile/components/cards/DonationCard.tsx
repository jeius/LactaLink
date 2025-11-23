import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { useFetchById } from '@/hooks/collections/useFetchById';
import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { Donation } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractID, extractOneImageData } from '@lactalink/utilities/extractors';
import isString from 'lodash/isString';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import DonationRequestStatusBadge from '../badges/DonationRequestStatusBadge';
import { ProfileTag } from '../ProfileTag';
import { DynamicStack, DynamicStackProps } from '../ui/DynamicStack';

type CardContentProps = Pick<DynamicStackProps, 'orientation'> & {
  data: Donation;
  disableLinks?: boolean;
};

interface DonationCardProps extends Omit<CardContentProps, 'data'> {
  data?: string | Donation;
  isLoading?: boolean;
}

const useDonationData = (data?: string | Donation) => {
  const query = useFetchById(isString(data), { collection: 'donations', id: extractID(data)! });
  return { ...query, data: extractCollection(data) ?? query.data };
};

export default function DonationCard({
  data: dataProp,
  isLoading: isLoadingProp,
  ...props
}: DonationCardProps) {
  const { data: donationData, isLoading: isDataLoading } = useDonationData(dataProp!);

  const isLoading = isLoadingProp || isDataLoading;

  if (isLoading || !donationData) {
    return <CardSkeleton orientation={props.orientation} />;
  }

  return <CardContent {...props} data={donationData} />;
}

function CardContent({ data, orientation = 'horizontal', disableLinks }: CardContentProps) {
  const { width: screenWidth } = useWindowDimensions();
  const isHorizontal = orientation === 'horizontal';
  const isVertical = orientation === 'vertical';

  const image = useMemo(() => {
    const imageSize = screenWidth < DEVICE_BREAKPOINTS.phone ? 'sm' : 'lg';
    const milkSamples = extractCollection(data?.details?.milkSample);
    return extractOneImageData(milkSamples, imageSize);
  }, [data.details.milkSample, screenWidth]);

  const volume = data.volume;

  return (
    <Card className="items-stretch p-0" style={{ maxWidth: 360 }}>
      <DynamicStack orientation={orientation}>
        <Box
          className="relative bg-primary-50"
          style={isHorizontal ? { width: 96, aspectRatio: 1 } : { height: 164, width: '100%' }}
        >
          <SingleImageViewer image={image} disabled={!disableLinks} />
        </Box>

        <HStack space="sm" className="flex-1 px-4 py-2">
          <VStack className="flex-1 items-start justify-center">
            <Text size="lg" className="font-JakartaExtraBold" numberOfLines={1}>
              {displayVolume(volume)}
            </Text>
            <Text
              size="sm"
              className="mb-1 font-JakartaMedium text-typography-700"
              numberOfLines={1}
            >
              Milk Donation
            </Text>
            {isHorizontal && <DonationRequestStatusBadge status={data.status} />}
          </VStack>

          <Box className={isVertical ? 'self-center' : 'self-end'}>
            {isVertical ? (
              <DonationRequestStatusBadge status={data.status} size="md" />
            ) : (
              <ProfileTag hideLabel profile={{ relationTo: 'individuals', value: data.donor }} />
            )}
          </Box>
        </HStack>

        {isVertical && (
          <Box className="p-4 pt-0">
            <ProfileTag profile={{ relationTo: 'individuals', value: data.donor }} label="Donor" />
          </Box>
        )}
      </DynamicStack>
    </Card>
  );
}

function CardSkeleton({ orientation = 'horizontal' }: Pick<CardContentProps, 'orientation'>) {
  const isHorizontal = orientation === 'horizontal';
  const isVertical = orientation === 'vertical';
  return (
    <Card className="items-stretch p-0" style={{ maxWidth: 360 }}>
      <DynamicStack orientation={orientation}>
        <Skeleton
          variant="sharp"
          style={isHorizontal ? { width: 96, aspectRatio: 1 } : { height: 164, width: '100%' }}
        />

        <HStack space="sm" className="flex-1 px-4 py-2">
          <VStack space="sm" className="flex-1 items-start justify-center">
            <Skeleton variant="sharp" className="h-6 w-24" />
            <Skeleton variant="sharp" className="h-4 w-32" />
            {isHorizontal && <Skeleton variant="circular" className="h-6 w-24" />}
          </VStack>

          <Box className={isVertical ? 'self-center' : 'self-end'}>
            {isVertical ? (
              <Skeleton variant="circular" className="h-8 w-24" />
            ) : (
              <Skeleton variant="circular" className="h-8 w-8" />
            )}
          </Box>
        </HStack>

        {isVertical && (
          <Box className="p-4 pt-1">
            <Skeleton variant="circular" className="h-8 w-8" />
          </Box>
        )}
      </DynamicStack>
    </Card>
  );
}
