import { AnimatedProgress } from '@/components/animated/progress';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { SingleImageViewer } from '@/components/ImageViewer';
import { ProfileTag } from '@/components/ProfileTag';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Donation } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { MilkIcon } from 'lucide-react-native';
import React from 'react';

export function Details({ data }: { data: Donation }) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.primary[50];
  const iconStrokeColor = themeColors.primary[700];

  const {
    details: { milkSample },
    remainingVolume,
    volume,
  } = data;

  const volumePercentage = Math.round((remainingVolume / volume) * 100);
  const image = extractOneImageData(extractCollection(milkSample));
  const donor = { value: data.donor, relationTo: 'individuals' } as const;

  return (
    <VStack space="lg" className="bg-background-0 px-4 pb-4 shadow">
      <Box className="h-40 w-full overflow-hidden rounded-2xl">
        <SingleImageViewer image={image} />
      </Box>

      <HStack className="items-center justify-between">
        <VStack>
          <Text bold size="xl">
            {displayVolume(volume)}
          </Text>
          <Text size="sm">Total Volume</Text>
        </VStack>

        <ProfileTag direction="rtl" label="Donor" profile={donor} />
      </HStack>

      <VStack space="lg">
        <VStack>
          <HStack space="sm" className="items-center justify-between">
            <Text size="sm" className="mb-1">
              Available Volume
            </Text>

            <Icon as={MilkIcon} size="sm" fill={iconFillColor} stroke={iconStrokeColor} />
          </HStack>

          <AnimatedProgress value={volumePercentage} size="sm" />

          <Text size="xs" className="mt-1 text-center text-typography-700">
            {remainingVolume.toLocaleString()} mL ({volumePercentage}%)
          </Text>
        </VStack>
      </VStack>
    </VStack>
  );
}

export function DetailsSkeleton() {
  return (
    <VStack space="lg" className="bg-background-0 px-4 pb-4 shadow">
      <Skeleton className="h-40 rounded-2xl" />

      <HStack className="items-center justify-between">
        <VStack space="sm">
          <Skeleton className="h-6 w-28" />
          <Skeleton variant="sharp" className="h-4 w-20" />
        </VStack>

        <Skeleton className="h-8 w-8 rounded-full" />
      </HStack>

      <VStack space="lg">
        <Skeleton className="h-3" />

        <HStack space="md" className="justify-stretch">
          <Skeleton className="h-10 flex-1" />

          <Skeleton className="h-10 flex-1" />
        </HStack>
      </VStack>
    </VStack>
  );
}
