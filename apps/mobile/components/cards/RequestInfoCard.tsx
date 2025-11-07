import { Request } from '@lactalink/types/payload-generated-types';
import React from 'react';

import { useMeUser } from '@/hooks/auth/useAuth';
import { DonationCreateParams } from '@/lib/types/donationRequest';
import { getUrgencyAction } from '@/lib/utils/getUrgencyAction';
import { URGENCY_LEVELS } from '@lactalink/enums';
import { extractCollection, extractImageData } from '@lactalink/utilities/extractors';
import { Link, useRouter } from 'expo-router';
import { HandHelpingIcon, MilkIcon } from 'lucide-react-native';
import { useTheme } from '../AppProvider/ThemeProvider';
import { SingleImageViewer } from '../ImageViewer';
import { ProfileTag } from '../ProfileTag';
import { AnimatedProgress } from '../animated/progress';
import { BasicBadge } from '../badges/BasicBadge';
import { DueDateTag, StorageTypeTag } from '../tags';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface RequestInfoCardProps {
  data: Request;
}

export function RequestInfoCard({ data }: RequestInfoCardProps) {
  const { themeColors } = useTheme();
  const iconFillColor = themeColors.tertiary[50];
  const iconStrokeColor = themeColors.tertiary[700];

  const { data: user } = useMeUser();
  const profile = extractCollection(user?.profile?.value);
  const router = useRouter();

  const {
    details: { urgency },
    initialVolumeNeeded,
    volumeFulfilled,
  } = data;

  const requester = extractCollection(data.requester);
  const volumePercentage = Math.round((volumeFulfilled / initialVolumeNeeded) * 100);
  const image = extractImageData(extractCollection(data.details.image));

  const isOwner = profile && profile.id === requester?.id;

  function handleDonatePress() {
    const params: DonationCreateParams = { mrid: data.id };
    router.push({ pathname: '/donations/create', params });
  }

  return (
    <Card className="w-full flex-col p-0">
      <Box className="relative h-40 w-full">
        <SingleImageViewer image={image} />

        <BasicBadge
          text={URGENCY_LEVELS[urgency].label}
          action={getUrgencyAction(urgency)}
          className="absolute left-3 top-3"
        />
      </Box>

      <HStack className="items-center justify-between p-4">
        <VStack>
          <Text bold size="lg">
            {initialVolumeNeeded.toLocaleString()} mL
          </Text>
          <Text size="sm">Total Needed</Text>
        </VStack>

        <ProfileTag
          direction="rtl"
          label="Requester"
          profile={requester && { value: requester, relationTo: 'individuals' }}
        />
      </HStack>

      <Divider />

      <VStack space="lg" className="p-4">
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

        <HStack space="md" className="w-full justify-stretch">
          {!isOwner && (
            <Box className="flex-1">
              <Button onPress={handleDonatePress}>
                <ButtonIcon as={HandHelpingIcon} />
                <ButtonText>Donate</ButtonText>
              </Button>
            </Box>
          )}
          <Box className="flex-1">
            <Link asChild push href={`/requests/${data.id}`}>
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
