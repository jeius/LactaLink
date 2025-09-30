import { getMilkBagStatusColor } from '@/lib/colors';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { MarkOptional } from '@lactalink/types/utils';
import { extractCollection, extractImageData } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import React, { useMemo } from 'react';
import { useTheme } from '../AppProvider/ThemeProvider';
import { SingleImageViewer } from '../ImageViewer';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface MilkBagCardProps extends MarkOptional<CardContentProps, 'data'> {
  isLoading?: boolean;
}

export function MilkBagCard({ data, isLoading, ...props }: MilkBagCardProps) {
  return (
    <Card variant="filled" className="w-40 p-0">
      {isLoading ? <CardSkeleton /> : data && <CardContent {...props} data={data} />}
    </Card>
  );
}

function CardSkeleton() {
  return (
    <VStack className="items-stretch">
      <Skeleton variant="sharp" className="h-32 w-full" />
      <VStack space="sm" className="w-full items-center px-3 py-2">
        <Skeleton variant="circular" className="h-5 w-2/3" />
        <Skeleton variant="circular" className="h-3 w-full" />
      </VStack>
    </VStack>
  );
}

interface CardContentProps {
  data: MilkBag;
  disableViewThumbnail?: boolean;
}

function CardContent({ data, disableViewThumbnail = false }: CardContentProps) {
  const { theme } = useTheme();

  const { image, volume, date, time, code, status, statusColor } = useMemo(() => {
    const image = extractImageData(extractCollection(data.bagImage));
    const volume = `${data.volume.toLocaleString()} mL`;
    const date = formatDate(data.collectedAt, { shortMonth: true });
    const time = formatLocaleTime(data.collectedAt);
    const code = data.code || 'No Code';
    const status = data.status;
    const statusColor = getMilkBagStatusColor(theme, status);
    return { image, volume, date, time, code, status, statusColor };
  }, [data, theme]);

  return (
    <VStack className="items-stretch">
      <VStack className="bg-primary-50 relative h-32 w-full flex-shrink-0 items-start justify-between overflow-hidden">
        <Box className="absolute inset-0">
          <SingleImageViewer image={image} disabled={disableViewThumbnail} />
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
            className="bg-typography-900 absolute inset-0"
            style={{ borderTopLeftRadius: 8, opacity: 0.75 }}
          />
          <Text size="sm" className="font-JakartaSemiBold text-typography-0 px-2 py-1 text-center">
            {code}
          </Text>
        </Box>
      </VStack>
      <VStack space="xs" className="px-3 py-2">
        <Text className="font-JakartaSemiBold text-center">{volume}</Text>
        <Text size="xs" className="text-center">
          {date}, {time}
        </Text>
      </VStack>
    </VStack>
  );
}
