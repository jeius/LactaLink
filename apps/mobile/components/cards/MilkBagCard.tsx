import { getMilkBagStatusColor } from '@/lib/colors';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { MarkOptional } from '@lactalink/types/utils';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractImageData } from '@lactalink/utilities/extractors';
import { formatDate } from '@lactalink/utilities/formatters';
import { ImageIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { SingleImageViewer } from '../ImageViewer';
import { Box } from '../ui/box';
import { Card, CardProps } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const baseStyle = tva({
  base: 'p-0',
  variants: {
    orientation: {
      horizontal: 'h-28 w-full',
      vertical: 'w-40',
    },
  },
});

interface MilkBagCardProps extends MarkOptional<CardContentProps, 'data'>, CardProps {
  isLoading?: boolean;
}

export function MilkBagCard({
  data,
  isLoading,
  variant = 'filled',
  className,
  disableViewThumbnail,
  orientation,
  ...props
}: MilkBagCardProps) {
  return (
    <Card {...props} variant={variant} className={baseStyle({ class: className, orientation })}>
      {isLoading ? (
        <CardSkeleton orientation={orientation} />
      ) : (
        data && (
          <CardContent
            disableViewThumbnail={disableViewThumbnail}
            data={data}
            orientation={orientation}
          />
        )
      )}
    </Card>
  );
}

function CardSkeleton({ orientation = 'vertical' }: Pick<CardContentProps, 'orientation'>) {
  if (orientation === 'horizontal') {
    return <Skeleton className="h-24 rounded-2xl" />;
  }
  return <Skeleton className="rounded-2xl" style={{ height: 184, width: 138 }} />;
}

interface CardContentProps {
  data: MilkBag;
  disableViewThumbnail?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

function CardContent({
  data,
  disableViewThumbnail = false,
  orientation = 'vertical',
}: CardContentProps) {
  const { image, volume, code, status, statusColor } = useMemo(() => {
    const image = extractImageData(extractCollection(data.bagImage));
    const volume = displayVolume(data.volume);
    const code = data.code || 'No Code';
    const status = data.status;
    const statusColor = getMilkBagStatusColor(status);
    return { image, volume, code, status, statusColor };
  }, [data]);

  if (orientation === 'horizontal') {
    return (
      <HStack className="items-stretch">
        <SingleImageViewer
          image={image}
          disabled={disableViewThumbnail}
          style={{ height: '100%', width: 96 }}
          fallback={
            <Box className="flex-1 items-center justify-center">
              <Icon as={ImageIcon} size="2xl" className="text-primary-500" />
            </Box>
          }
        />
        <VStack space="xs" className="justify-center px-3 py-2">
          <Text size="lg" className="font-JakartaExtraBold">
            {code}
          </Text>
          <Text size="sm" className="text-left font-JakartaMedium">
            Volume: {volume}
          </Text>
          <Text size="sm" className="text-left font-JakartaMedium">
            Collected at: {formatDate(data.collectedAt, { shortMonth: true })}
          </Text>
        </VStack>

        <Text
          size="sm"
          bold
          className="absolute right-0 top-0 px-3 py-2 text-white"
          style={{ borderBottomLeftRadius: 8, backgroundColor: statusColor }}
        >
          {MILK_BAG_STATUS[status].label}
        </Text>
      </HStack>
    );
  }

  return (
    <VStack className="items-stretch">
      <VStack className="relative h-32 w-full flex-shrink-0 items-start justify-between overflow-hidden bg-primary-50">
        <Box className="absolute inset-0">
          <SingleImageViewer
            image={image}
            disabled={disableViewThumbnail}
            className="flex-1"
            fallback={
              <Box className="flex-1 items-center">
                <Icon as={ImageIcon} size="2xl" className="my-auto text-primary-500" />
              </Box>
            }
          />
        </Box>
        <Text
          size="sm"
          bold
          className="px-2 py-1 text-white"
          style={{ borderBottomRightRadius: 8, backgroundColor: statusColor }}
        >
          {MILK_BAG_STATUS[status].label}
        </Text>
        <Box className="self-end">
          <Box
            className="absolute inset-0 bg-typography-900"
            style={{ borderTopLeftRadius: 8, opacity: 0.75 }}
          />
          <Text size="sm" className="px-2 py-1 text-center font-JakartaSemiBold text-typography-0">
            {code}
          </Text>
        </Box>
      </VStack>
      <VStack space="xs" className="px-3 py-2">
        <Text bold size="lg" className="text-center">
          {volume}
        </Text>
        <Text size="xs" className="text-left">
          Collected at: {new Date(data.collectedAt).toLocaleDateString()}
        </Text>
      </VStack>
    </VStack>
  );
}
