import { segregateMilkBags } from '@/lib/utils/segregateMilkBags';
import { COLLECTION_MODES, PREFERRED_STORAGE_TYPES } from '@lactalink/enums';

import {
  Avatar as AvatarType,
  Donation,
  Image as ImageType,
  Individual,
  MilkBag,
} from '@lactalink/types/payload-generated-types';

import { EditIcon, MilkIcon, PackagePlusIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';

import { useMeUser } from '@/hooks/auth/useAuth';
import { RequestSearchParams } from '@/lib/types/donationRequest';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { AnimatedProgress } from '../animated/progress';
import Avatar from '../Avatar';
import { ImageViewer } from '../ImageViewer';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { Textarea, TextareaInput } from '../ui/textarea';
import { VStack } from '../ui/vstack';

interface DonationInfoCardProps {
  data: Donation;
}

export function DonationInfoCard({ data }: DonationInfoCardProps) {
  const router = useRouter();
  const { data: user } = useMeUser();
  const profile = extractCollection(user?.profile?.value);

  const {
    details: { bags, collectionMode, storageType, milkSample, notes },
    remainingVolume,
    volume,
  } = data;

  const progressValue = remainingVolume && volume ? (remainingVolume / volume) * 100 : 0;

  const availableBags = useMemo(
    () => (bags as MilkBag[]).filter((bag) => bag.status === 'AVAILABLE'),
    [bags]
  );
  const segregatedBags = useMemo(() => segregateMilkBags(availableBags), [availableBags]);

  const donor = data.donor as Individual;
  const donorName = donor.displayName;
  const donorAvatar = donor.avatar as AvatarType | null | undefined;

  const milkImages = milkSample as ImageType[] | undefined | null;
  const images =
    milkImages
      ?.map((image) => {
        const imageUrl = image.sizes?.large?.url || image.url;
        if (!imageUrl) return null;
        return {
          uri: imageUrl,
          blurHash: image.blurHash || undefined,
        };
      })
      .filter((v) => v !== null) || [];

  const isOwner = profile && profile.id === donor.id;

  function handleRequestPress() {
    const params: RequestSearchParams = { matchedDonation: data.id };
    if (isOwner) {
      router.push(`/donations/edit/${data.id}`);
    } else {
      router.push({ pathname: '/requests/create', params });
    }
  }

  return (
    <Card className="w-full">
      <VStack space="md">
        {images.length > 0 && (
          <Box className="h-44 w-full overflow-hidden rounded-lg">
            <ImageViewer images={images} />
          </Box>
        )}

        <Text className="font-JakartaMedium mt-1">Donation Details</Text>

        <VStack>
          <HStack space="sm" className="items-center justify-between">
            <Text size="sm" className="mb-1">
              Available Volume
            </Text>
            <Icon as={MilkIcon} size="sm" className="text-primary-500" />
          </HStack>
          <AnimatedProgress value={progressValue} size="sm" />
          {remainingVolume && volume && (
            <Text size="xs" className="text-typography-600 mt-1 text-center">
              {remainingVolume} / {volume} mL
            </Text>
          )}
        </VStack>

        <VStack className="mb-1">
          <Text size="sm" className="mb-1">
            Available Milk Bags
          </Text>
          <HStack space="sm" className="flex-wrap">
            {Object.entries(segregatedBags).map(([key, bags]) => (
              <Box key={key} className={`bg-primary-200 mb-2 mr-2 rounded-md px-2 py-1`}>
                <Text size="xs" className="text-primary-900">
                  {bags.length} x {key.split('-')[0] || 20} mL
                </Text>
              </Box>
            ))}
          </HStack>
        </VStack>

        <Text size="sm">
          Storage type:{' '}
          <Text size="sm" className="text-primary-500 font-JakartaSemiBold">
            {PREFERRED_STORAGE_TYPES[storageType].label}
          </Text>
        </Text>

        <Text size="sm">
          Collection method:{' '}
          <Text size="sm" className="text-primary-500 font-JakartaSemiBold">
            {COLLECTION_MODES[collectionMode].label}
          </Text>
        </Text>

        {donorName && (
          <VStack space="xs" className="items-start">
            <Text size="sm">Donated by:</Text>
            <Button size="sm" variant="link" className="h-fit">
              {donorAvatar && (
                <Avatar size="sm" details={{ avatar: donorAvatar, name: donorName }} />
              )}
              <ButtonText className="underline">{donorName}</ButtonText>
            </Button>
          </VStack>
        )}

        {
          <VStack space="sm">
            <Textarea size="sm" pointerEvents="none">
              <TextareaInput
                defaultValue={notes || ''}
                placeholder="No note provided."
                editable={false}
                style={{ textAlignVertical: 'top' }}
              />
            </Textarea>
          </VStack>
        }

        <Button onPress={handleRequestPress}>
          <ButtonIcon as={isOwner ? EditIcon : PackagePlusIcon} />
          <ButtonText>{isOwner ? 'Edit Donation' : 'Request This Donation'}</ButtonText>
        </Button>
      </VStack>
    </Card>
  );
}
