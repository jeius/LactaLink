import { COLLECTION_MODES, STORAGE_TYPES } from '@/lib/constants';
import { Avatar as AvatarType, Donation, Image as ImageType, Individual } from '@lactalink/types';
import React from 'react';
import { AnimatedPressable, AnimatedPressableProps } from '../animated/pressable';
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '../ui/avatar';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Image } from '../ui/image';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface DonationCardProps extends AnimatedPressableProps {
  data: Donation;
}

export default function DonationCard({ data, ...props }: DonationCardProps) {
  const {
    details: { milkSample, storageType, collectionMode },
    remainingVolume,
    donor,
  } = data;

  const donorName =
    (donor as Individual)?.displayName || (donor as Individual)?.givenName || 'Unknown Donor';
  const donorAvatar = (donor as Individual)?.avatar as AvatarType | null;

  const milkSampleUrl = (milkSample as ImageType[] | null)?.[0]?.sizes?.medium?.url || null;
  const milkSampleAlt = (milkSample as ImageType[] | null)?.[0]?.alt || 'Milk Sample Image';

  return (
    <AnimatedPressable {...props}>
      <Card className="p-0">
        <VStack space="md">
          <Box className="bg-background-muted relative aspect-square h-48">
            <Box className="h-full w-full overflow-hidden">
              {milkSampleUrl ? (
                <Image
                  source={{ uri: milkSampleUrl }}
                  size="full"
                  resizeMode="cover"
                  alt={milkSampleAlt}
                />
              ) : (
                <Text className="m-auto">No Image</Text>
              )}
            </Box>

            <VStack
              className="justify-between"
              style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <HStack>
                <Text
                  size="xs"
                  className="bg-primary-400 font-JakartaMedium px-2 py-1"
                  style={{ borderBottomRightRadius: 12 }}
                >
                  {STORAGE_TYPES[storageType].label}
                </Text>
              </HStack>

              <VStack className="items-center">
                <Box
                  className="bg-primary-400 flex-col items-center rounded-lg px-3 py-2 opacity-90"
                  style={{ minWidth: 90 }}
                >
                  <Text size="xs">Available</Text>
                  <Text size="xl" className="font-JakartaMedium">
                    {remainingVolume || 0}{' '}
                    <Text size="sm" className="font-JakartaMedium">
                      mL
                    </Text>
                  </Text>
                </Box>
              </VStack>

              <Text size="xs" className="bg-primary-300 font-JakartaMedium px-2 py-1 opacity-90">
                {COLLECTION_MODES[collectionMode].label}
              </Text>
            </VStack>
          </Box>

          <HStack space="sm" className="items-center p-2">
            <Avatar size="sm">
              <AvatarFallbackText>{donorName}</AvatarFallbackText>
              {donorAvatar?.thumbnailURL && (
                <AvatarImage
                  alt={donorAvatar?.alt || 'Avatar'}
                  source={{ uri: donorAvatar?.thumbnailURL }}
                />
              )}
              <AvatarBadge />
            </Avatar>
            <Text size="xs" className="flex-1 flex-wrap">
              {donorName}
            </Text>
          </HStack>
        </VStack>
      </Card>
    </AnimatedPressable>
  );
}
