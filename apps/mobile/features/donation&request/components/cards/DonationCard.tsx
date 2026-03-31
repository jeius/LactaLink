import { ProfileAvatar } from '@/components/Avatar';
import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Card, CardProps } from '@/components/ui/card';
import { DynamicStack, DynamicStackProps } from '@/components/ui/DynamicStack';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { DEVICE_BREAKPOINTS } from '@/lib/constants';
import { STORAGE_TYPES } from '@lactalink/enums';
import { Donation } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { ImageIcon } from 'lucide-react-native';
import { FC, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useDonation } from '../../hooks/queries';
import StatusBadge from '../StatusBadge';

type BaseProps = Pick<DynamicStackProps, 'orientation'> &
  Pick<CardProps, 'variant' | 'className' | 'style'> & {
    data: Donation;
  };

interface DonationCardProps extends Omit<BaseProps, 'data'> {
  data: string | Donation;
}

function CardSkeleton({ orientation = 'horizontal' }: Pick<BaseProps, 'orientation'>) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <Skeleton
      variant="rounded"
      className="rounded-2xl"
      style={isHorizontal ? { height: 96, maxWidth: 420 } : { height: 180, maxWidth: 420 }}
    />
  );
}

function MainCard({
  data,
  orientation = 'horizontal',
  variant = 'elevated',
  className,
  style,
}: BaseProps) {
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
    <Card
      variant={variant}
      className={className}
      style={StyleSheet.flatten([{ maxWidth: 360, padding: 0 }, style])}
    >
      <DynamicStack orientation={orientation}>
        <Box
          className="relative border-primary-500 bg-primary-50"
          style={
            isHorizontal
              ? { width: 96, aspectRatio: 1, borderRightWidth: 4 }
              : { height: 164, width: '100%', borderBottomWidth: 4 }
          }
        >
          <SingleImageViewer
            image={image}
            disabled
            className="flex-1"
            fallback={
              <Box className="flex-1 items-center justify-center">
                <Icon as={ImageIcon} className="stroke-primary-500" size="2xl" />
              </Box>
            }
          />
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
            {isHorizontal && <StatusBadge status={data.status} />}
          </VStack>

          <Box className={isVertical ? 'self-center' : 'self-end'}>
            {isVertical ? (
              <StatusBadge status={data.status} size="md" />
            ) : (
              <ProfileAvatar size="sm" profile={{ relationTo: 'individuals', value: data.donor }} />
            )}
          </Box>
        </HStack>
      </DynamicStack>
    </Card>
  );
}

function DonationCard({ data: dataProp, ...props }: DonationCardProps) {
  const { data: data, isLoading } = useDonation(dataProp);

  if (isLoading || !data) {
    return <CardSkeleton orientation={props.orientation} />;
  }

  return <MainCard {...props} data={data} />;
}

export { CardSkeleton as DonationCardSkeleton };

DonationCard.Skeleton = CardSkeleton;

export default DonationCard as FC<DonationCardProps> & { Skeleton: typeof CardSkeleton };
