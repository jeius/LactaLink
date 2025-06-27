import { COLLECTION_MODES, STORAGE_TYPES } from '@/lib/constants';
import { Avatar as AvatarType, Donation, Image as ImageType, Individual } from '@lactalink/types';
import React from 'react';
import { AnimatedPressable, AnimatedPressableProps } from '../animated/pressable';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

import { Image } from '@/components/Image';
import { BLUR_HASH } from '@/lib/constants';
import Avatar from '../Avatar';

interface DonationCardProps extends Omit<AnimatedPressableProps, 'children'> {
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

  const milkSamples = milkSample as ImageType[] | null;
  const milkSampleUrl = milkSamples?.[0]?.sizes?.medium?.url || milkSamples?.[0]?.url || null;

  return (
    <AnimatedPressable {...props}>
      <Card className="p-0">
        <VStack>
          <Box className="bg-primary-50 relative aspect-square h-48">
            <Box className="h-full w-full overflow-hidden">
              {milkSampleUrl ? (
                <Image
                  source={{ uri: milkSampleUrl }}
                  contentFit="cover"
                  contentPosition="center"
                  style={{ width: '100%', height: '100%' }}
                  alt={`Donation Milk Sample`}
                  placeholder={{ blurhash: BLUR_HASH }}
                  cachePolicy={'memory-disk'}
                  recyclingKey={`donation-image-${data.id}`}
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
                  <Text size="2xl" className="font-JakartaSemiBold">
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
            <Avatar size="sm" details={{ avatar: donorAvatar, name: donorName }} />
            <Text size="xs" className="flex-1 flex-wrap">
              {donorName}
            </Text>
          </HStack>
        </VStack>
      </Card>
    </AnimatedPressable>
  );
}

export function DonationSkeleton() {
  return (
    <Card className="p-0">
      <VStack space="md">
        <Box className="bg-background-muted relative aspect-square h-48">
          <Box className="h-full w-full overflow-hidden">
            <Skeleton startColor="bg-background-300" speed={4} />
          </Box>

          <VStack
            className="justify-between"
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          >
            <HStack>
              <Skeleton
                speed={2}
                startColor="bg-primary-0"
                className="h-6 w-16"
                style={{ borderBottomRightRadius: 12 }}
              />
            </HStack>

            <VStack className="items-center">
              <Skeleton
                speed={2}
                startColor="bg-primary-0"
                className="h-12 w-20"
                variant="rounded"
              />
            </VStack>

            <Skeleton speed={2} startColor="bg-primary-0" className="h-6" />
          </VStack>
        </Box>

        <HStack space="sm" className="items-center p-2">
          <Skeleton
            speed={4}
            startColor="bg-background-300"
            className="h-8 w-8"
            variant="circular"
          />
          <Skeleton
            speed={4}
            startColor="bg-background-300"
            className="h-6 w-24"
            variant="rounded"
          />
        </HStack>
      </VStack>
    </Card>
  );
}
