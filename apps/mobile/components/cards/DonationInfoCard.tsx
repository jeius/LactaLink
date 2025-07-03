import { COLLECTION_MODES, STORAGE_TYPES } from '@/lib/constants';
import { segregateMilkBags } from '@/lib/utils/segregateMilkBags';

import {
  Avatar as AvatarType,
  Donation,
  Image as ImageType,
  Individual,
  MilkBag,
} from '@lactalink/types';
import { MilkIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';

import { Dimensions } from 'react-native';
import { AnimatedProgress } from '../animated/progress';
import Avatar from '../Avatar';
import { ImageCarousel } from '../ImageCarousel';
import { Box } from '../ui/box';
import { Button, ButtonText } from '../ui/button';
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
  const {
    details: { bags, collectionMode, storageType, milkSample, notes },
    donor,
    remainingVolume,
    volume,
  } = data;

  const { width } = Dimensions.get('window');

  const progressValue = remainingVolume && volume ? (remainingVolume / volume) * 100 : 0;

  const availableBags = useMemo(
    () => (bags as MilkBag[]).filter((bag) => bag.status === 'AVAILABLE'),
    [bags]
  );
  const segregatedBags = useMemo(() => segregateMilkBags(availableBags), [availableBags]);

  const donorName = (donor as Individual).displayName;
  const donorAvatar = (donor as Individual).avatar as AvatarType | null | undefined;

  const milkImages = milkSample as ImageType[] | undefined | null;

  return (
    <Card className="w-full">
      <VStack space="md">
        {milkImages && milkImages.length > 0 && (
          <ImageCarousel
            carouselWidth={width * 0.75}
            carouselHeight={width * 0.45}
            images={milkImages}
          />
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
                  {bags.length} x {key} mL
                </Text>
              </Box>
            ))}
          </HStack>
        </VStack>

        <Text size="sm">
          Storage type:{' '}
          <Text size="sm" className="text-primary-500 font-JakartaSemiBold">
            {STORAGE_TYPES[storageType].label}
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
      </VStack>
    </Card>
  );
}
