import { AnimatedProgress } from '@/components/animated/progress';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { BasicBadge } from '@/components/badges/BasicBadge';
import { SingleImageViewer } from '@/components/ImageViewer';
import { ProfileTag } from '@/components/ProfileTag';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DueDateTag, StorageTypeTag } from '@/features/donation&request/components/tags';
import { useMeUser } from '@/hooks/auth/useAuth';
import { DonationCreateParams } from '@/lib/types/donationRequest';
import { getUrgencyAction } from '@/lib/utils/getUrgencyAction';
import { URGENCY_LEVELS } from '@lactalink/enums';
import { Request } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection, extractImageData } from '@lactalink/utilities/extractors';
import { Link, useRouter } from 'expo-router';
import { HandHelpingIcon, MilkIcon } from 'lucide-react-native';
import React from 'react';

export function Details({ data }: { data: Request }) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.tertiary[50];
  const iconStrokeColor = themeColors.tertiary[700];

  const router = useRouter();
  const { data: user } = useMeUser();

  const {
    details: { urgency },
    initialVolumeNeeded,
    volumeFulfilled,
  } = data;

  const volumePercentage = Math.round((volumeFulfilled / initialVolumeNeeded) * 100);
  const image = extractImageData(extractCollection(data.details.image));
  const requester = { relationTo: 'individuals', value: data.requester } as const;
  const isOwner = isEqualProfiles(user?.profile, requester);

  function handleDonatePress() {
    const params: DonationCreateParams = { mrid: data.id };
    router.push({ pathname: '/donations/create', params });
  }

  return (
    <VStack space="lg">
      <Box className="h-40 w-full overflow-hidden rounded-2xl">
        <SingleImageViewer image={image} />
        <BasicBadge
          text={URGENCY_LEVELS[urgency].label}
          action={getUrgencyAction(urgency)}
          className="absolute left-3 top-3"
        />
      </Box>

      <HStack className="items-center justify-between">
        <VStack>
          <Text bold size="xl">
            {displayVolume(initialVolumeNeeded)}
          </Text>
          <Text size="sm">Total Needed</Text>
        </VStack>

        <ProfileTag direction="rtl" label="Requester" profile={requester} />
      </HStack>

      <VStack space="lg">
        <HStack space="2xl" className="flex-wrap items-center">
          <StorageTypeTag data={data} />
          <DueDateTag data={data} />
        </HStack>

        <VStack>
          <HStack space="sm" className="items-center justify-between">
            <Text size="sm" className="mb-1">
              Volume Fulfilled
            </Text>
            <Icon as={MilkIcon} size="sm" fill={iconFillColor} stroke={iconStrokeColor} />
          </HStack>
          <AnimatedProgress
            value={volumePercentage}
            size="sm"
            trackColor={themeColors.tertiary[500]}
          />
          <Text size="xs" className="mt-1 text-center text-typography-700">
            {volumeFulfilled.toLocaleString()} mL ({volumePercentage}%)
          </Text>
        </VStack>

        <HStack space="md">
          {!isOwner && (
            <Button className="flex-1" onPress={handleDonatePress}>
              <ButtonIcon as={HandHelpingIcon} />
              <ButtonText>Donate</ButtonText>
            </Button>
          )}

          <Link asChild push href={`/requests/${data.id}`}>
            <Button className="flex-1" action="default" variant="outline">
              <ButtonText>View More</ButtonText>
            </Button>
          </Link>
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
