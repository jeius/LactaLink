import { Donation, Image as ImageType } from '@lactalink/types/payload-generated-types';

import { MilkIcon, PackagePlusIcon } from 'lucide-react-native';
import React from 'react';

import { useMeUser } from '@/hooks/auth/useAuth';
import { RequestSearchParams } from '@/lib/types/donationRequest';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';
import { Link, useRouter } from 'expo-router';
import { AnimatedProgress } from '../animated/progress';
import { useTheme } from '../AppProvider/ThemeProvider';
import { SingleImageViewer } from '../ImageViewer';
import { ProfileTag } from '../ProfileTag';
import { CollectionMethodTag, StorageTypeTag } from '../tags';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface DonationInfoCardProps {
  data: Donation;
}

export function DonationInfoCard({ data }: DonationInfoCardProps) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.primary[50];
  const iconStrokeColor = themeColors.primary[700];

  const router = useRouter();
  const { data: user } = useMeUser();
  const profile = extractCollection(user?.profile?.value);

  const {
    details: { milkSample },
    remainingVolume,
    volume,
  } = data;

  const volumePercentage = Math.round((remainingVolume / volume) * 100);

  const donor = extractCollection(data.donor);

  const milkImages = milkSample as ImageType[] | undefined | null;
  const image = extractOneImageData(milkImages);

  const isOwner = profile && profile.id === donor?.id;

  function handleRequestPress() {
    const params: RequestSearchParams = { matchedDonation: data.id };
    router.push({ pathname: '/requests/create', params });
  }

  return (
    <Card className="w-full flex-col p-0">
      <Box className="h-40 w-full overflow-hidden">
        <SingleImageViewer image={image} />
      </Box>

      <HStack className="items-center justify-between p-4">
        <VStack>
          <Text bold size="lg">
            {volume.toLocaleString()} mL
          </Text>
          <Text size="sm">Total Volume</Text>
        </VStack>

        <ProfileTag
          direction="rtl"
          label="Donor"
          profile={donor && { value: donor, relationTo: 'individuals' }}
        />
      </HStack>

      <Divider />

      <VStack space="lg" className="p-4">
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
          <Text size="xs" className="text-typography-700 mt-1 text-center">
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
              <Button variant="outline">
                <ButtonText>View More</ButtonText>
              </Button>
            </Link>
          </Box>
        </HStack>
      </VStack>
    </Card>
  );
}
