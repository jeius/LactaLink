import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getMilkBagStatusColor } from '@/lib/colors';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractImageData } from '@lactalink/utilities/extractors';
import { formatDate } from '@lactalink/utilities/formatters';
import { CalendarPlusIcon, CalendarX2Icon, ImageIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';

const baseStyle = tva({
  base: 'w-44 p-0',
});

interface MilkBagCardProps extends CardProps {
  data: MilkBag;
  disableViewThumbnail?: boolean;
}

function MilkBagCard({
  data,
  variant = 'filled',
  className,
  disableViewThumbnail,
  ...props
}: MilkBagCardProps) {
  const { image, volumeText, code, status, statusColor } = useMemo(() => {
    const image = extractImageData(extractCollection(data.bagImage));
    const volumeText = displayVolume(data.volume);
    const code = data.code || 'No Code';
    const status = data.status;
    const statusColor = getMilkBagStatusColor(status);
    return { image, volumeText, code, status, statusColor };
  }, [data]);

  return (
    <Card {...props} variant={variant} className={baseStyle({ class: className })}>
      <VStack className="h-32 w-full justify-between overflow-hidden bg-primary-50">
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
          className="self-start px-2 py-1 text-white"
          style={{ borderBottomRightRadius: 8, backgroundColor: statusColor }}
        >
          {MILK_BAG_STATUS[status].label}
        </Text>

        <Box className="self-end bg-typography-900/75 px-2 py-1" style={{ borderTopLeftRadius: 8 }}>
          <Text size="sm" className="font-JakartaSemiBold text-typography-0">
            {code}
          </Text>
        </Box>
      </VStack>

      <VStack space="sm" className="p-3 pt-2">
        <Text bold size="lg" className="text-center">
          {volumeText}
        </Text>

        <HStack space="sm">
          <Icon as={CalendarPlusIcon} />
          <Text size="sm" className="flex-1 font-JakartaMedium">
            {formatDate(data.collectedAt, { shortMonth: true })}
          </Text>
        </HStack>

        <HStack space="sm">
          <Icon as={CalendarX2Icon} className="text-error-500" />
          <Text size="sm" className="flex-1 font-JakartaMedium text-error-500">
            {formatDate(data.expiresAt, { shortMonth: true })}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}

function CardSkeleton() {
  return <Skeleton className="w-44 rounded-2xl" style={{ height: 184 }} />;
}

export default Object.assign(MilkBagCard, {
  Skeleton: CardSkeleton,
});
