import { ProfileAvatar } from '@/components/Avatar';
import { BasicBadge } from '@/components/badges';
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
import { getUrgencyAction } from '@/lib/utils/getUrgencyAction';
import { PREFERRED_STORAGE_TYPES, URGENCY_LEVELS } from '@lactalink/enums';
import { Request } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { ImageIcon } from 'lucide-react-native';
import { FC, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useRequest } from '../../hooks/queries';

type BaseProps = Pick<DynamicStackProps, 'orientation'> &
  Pick<CardProps, 'variant' | 'className' | 'style'> & {
    data: Request;
  };

interface RequestCardProps extends Omit<BaseProps, 'data'> {
  data: string | Request;
}

export function CardSkeleton({ orientation = 'horizontal' }: Pick<BaseProps, 'orientation'>) {
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
    const milkSamples = extractCollection(data.details.image);
    return extractOneImageData(milkSamples, imageSize);
  }, [data.details.image, screenWidth]);

  const volume = data.volumeNeeded;
  const urgency = data.details.urgency;
  const preferredStorage = data.details.storagePreference ?? PREFERRED_STORAGE_TYPES.EITHER.value;

  return (
    <Card
      variant={variant}
      className={className}
      style={StyleSheet.flatten([{ maxWidth: 360, padding: 0 }, style])}
    >
      <DynamicStack orientation={orientation}>
        <Box
          className="relative border-tertiary-500 bg-tertiary-50"
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
                <Icon as={ImageIcon} className="stroke-tertiary-500" size="2xl" />
              </Box>
            }
          />
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

function RequestCard({ data: dataProp, ...props }: RequestCardProps) {
  const { data, isLoading } = useRequest(dataProp);

  if (isLoading || !data) {
    return <CardSkeleton orientation={props.orientation} />;
  }

  return <MainCard {...props} data={data} />;
}

export { CardSkeleton as RequestCardSkeleton };

RequestCard.Skeleton = CardSkeleton;

export default RequestCard as FC<RequestCardProps> & { Skeleton: typeof CardSkeleton };
