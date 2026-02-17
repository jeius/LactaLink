import { AnimatedProgress } from '@/components/animated/progress';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { SingleImageViewer } from '@/components/ImageViewer';
import { ProfileTag } from '@/components/ProfileTag';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CollectionMethodTag, StorageTypeTag } from '@/features/donation&request/components/tags';
import { useMeUser } from '@/hooks/auth/useAuth';
import { RequestCreateParams } from '@/lib/types/donationRequest';
import { Donation } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { Link, useRouter } from 'expo-router';
import { MilkIcon, PackagePlusIcon } from 'lucide-react-native';
import React from 'react';

export function Details({ data }: { data: Donation }) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.primary[50];
  const iconStrokeColor = themeColors.primary[700];

  const router = useRouter();
  const { data: user } = useMeUser();

  const {
    details: { milkSample },
    remainingVolume,
    volume,
  } = data;

  const volumePercentage = Math.round((remainingVolume / volume) * 100);
  const donor = { value: data.donor, relationTo: 'individuals' } as const;
  const image = extractOneImageData(extractCollection(milkSample));
  const isOwner = isEqualProfiles(user?.profile, donor);

  function handleRequestPress() {
    const params: RequestCreateParams = { mdid: data.id };
    router.push({ pathname: '/requests/create', params });
  }

  return (
    <VStack space="lg">
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
        <HStack space="2xl" className="flex-wrap items-center">
          <StorageTypeTag data={data} />
          <CollectionMethodTag data={data} />
        </HStack>

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

        <HStack space="md" className="w-full justify-stretch">
          {!isOwner && (
            <Box className="flex-1">
              <Button onPress={handleRequestPress}>
                <ButtonIcon as={PackagePlusIcon} />
                <ButtonText>Request</ButtonText>
              </Button>
            </Box>
          )}

          <Box className="flex-1">
            <Link asChild push href={`/donations/${data.id}`}>
              <Button action="default" variant="outline">
                <ButtonText>View More</ButtonText>
              </Button>
            </Link>
          </Box>
        </HStack>
      </VStack>
    </VStack>
  );
}

export function DetailsSkeleton() {
  return (
    <VStack space="lg" className="pb-4">
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
