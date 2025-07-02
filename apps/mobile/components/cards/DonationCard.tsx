import { STORAGE_TYPES } from '@/lib/constants';
import {
  Address,
  Avatar as AvatarType,
  DeliveryPreference,
  Donation,
  Image as ImageType,
  Individual,
} from '@lactalink/types';
import React from 'react';
import { AnimatedPressable, AnimatedPressableProps } from '../animated/pressable';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

import { Image } from '@/components/Image';
import { useCurrentLocation } from '@/hooks/location/useLocation';
import { BLUR_HASH } from '@/lib/constants';
import { getIconAsset } from '@/lib/stores';
import { convertDistance, getDistance } from '@lactalink/utilities';
import { Asset } from 'expo-asset';
import { MapPinIcon } from 'lucide-react-native';
import Avatar from '../Avatar';
import { Icon } from '../ui/icon';

interface DonationCardProps extends Omit<AnimatedPressableProps, 'children'> {
  data: Donation;
}

const iconAssets: Record<DeliveryPreference['preferredMode'][number], Asset> = {
  DELIVERY: getIconAsset('scooterWithBasket'),
  PICKUP: getIconAsset('pickUp'),
  MEETUP: getIconAsset('meetUp'),
};

export default function DonationCard({ data, ...props }: DonationCardProps) {
  const {
    details: { milkSample, storageType },
    remainingVolume,
    donor,
    deliveryDetails,
  } = data;

  const { location } = useCurrentLocation();

  const donorName =
    (donor as Individual)?.displayName || (donor as Individual)?.givenName || 'Unknown Donor';
  const donorAvatar = (donor as Individual)?.avatar as AvatarType | null;

  const milkSamples = milkSample as ImageType[] | null;
  const milkSampleUrl = milkSamples?.[0]?.sizes?.medium?.url || milkSamples?.[0]?.url || null;

  const preference = deliveryDetails as DeliveryPreference[];
  const preferredMode = preference?.[0]?.preferredMode;
  const [latitude, longitude] = (preference?.[0]?.address as Address)?.coordinates || [0, 0];

  const distance =
    location &&
    convertDistance(
      getDistance(
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
        { latitude, longitude }
      ),
      'km'
    );

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
                <VStack
                  className="bg-primary-400 font-JakartaMedium px-3 py-1"
                  style={{ borderBottomRightRadius: 12 }}
                >
                  <Text size="2xs">Available</Text>
                  <Text size="xl" className="font-JakartaSemiBold">
                    {remainingVolume || 0}{' '}
                    <Text size="xs" className="font-JakartaMedium">
                      mL
                    </Text>
                  </Text>
                </VStack>
              </HStack>

              <Text size="xs" className="bg-primary-300 font-JakartaMedium px-2 py-1 opacity-90">
                {STORAGE_TYPES[storageType].label}
              </Text>
            </VStack>
          </Box>

          <HStack space="sm" className="items-center justify-between p-2 pb-1">
            <HStack space="xs">
              {preferredMode?.map((mode, i) => (
                <Image
                  key={i}
                  source={iconAssets[mode]}
                  alt={`${mode} icon`}
                  style={{ width: 12, height: 12 }}
                />
              ))}
            </HStack>

            <HStack space="xs">
              <Icon as={MapPinIcon} size="xs" className="text-primary-500" />
              <Text size="xs">{distance?.toFixed(2)} km</Text>
            </HStack>
          </HStack>

          <HStack space="sm" className="items-center p-2">
            <Avatar size="sm" details={{ avatar: donorAvatar, name: donorName }} />
            <Text size="xs" className="flex-1">
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
      <VStack>
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
                className="h-12 w-20"
                style={{ borderBottomRightRadius: 12 }}
              />
            </HStack>

            <Skeleton speed={2} startColor="bg-primary-0" className="h-6" />
          </VStack>
        </Box>

        <VStack space="sm" className="p-2">
          <HStack space="sm" className="justify-between">
            <Skeleton
              speed={4}
              startColor="bg-background-300"
              className="h-6 w-14"
              variant="rounded"
            />
            <Skeleton
              speed={4}
              startColor="bg-background-300"
              className="h-6 w-12"
              variant="rounded"
            />
          </HStack>

          <HStack space="sm" className="items-center">
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
      </VStack>
    </Card>
  );
}
