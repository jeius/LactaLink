import { DEVICE_BREAKPOINTS, STORAGE_TYPES } from '@/lib/constants';
import { Donation } from '@lactalink/types';
import React, { useMemo } from 'react';
import { AnimatedPressable, AnimatedPressableProps } from '../animated/pressable';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

import { Image } from '@/components/Image';
import { useLocationStore } from '@/lib/stores/locationStore';
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { getNearestDeliveryPreference } from '@/lib/utils/getNearestDeliveryPreference';
import { extractCollection, extractOneImageData } from '@lactalink/utilities';
import { useWindowDimensions } from 'react-native';
import Avatar from '../Avatar';
import BasicLocationPin from '../icons/BasicLocationPin';
import { SingleImageViewer } from '../ImageViewer';
import { Icon } from '../ui/icon';

interface DonationCardProps extends Omit<AnimatedPressableProps, 'children'> {
  data?: Donation;
  isLoading?: boolean;
}

export default function DonationCard({ data, isLoading, ...props }: DonationCardProps) {
  const coords = useLocationStore((s) => s.coordinates);
  const { width: screenWidth } = useWindowDimensions();

  const { distance, deliveryPreference } = useMemo(
    () =>
      getNearestDeliveryPreference(extractCollection(data?.deliveryPreferences), coords) || {
        deliveryPreference: null,
        distance: null,
      },
    [coords, data?.deliveryPreferences]
  );

  const { details: { storageType } = {}, remainingVolume } = data || {};

  const donor = extractCollection(data?.donor);
  const donorName = donor?.displayName || donor?.givenName || 'Unknown Donor';
  const donorAvatar = extractCollection(donor?.avatar);

  const { uri, blurHash, alt } = useMemo(() => {
    const imageSize = screenWidth < DEVICE_BREAKPOINTS.phone ? 'sm' : 'lg';
    const milkSamples = extractCollection(data?.details?.milkSample);
    return extractOneImageData(milkSamples, imageSize);
  }, [data?.details?.milkSample, screenWidth]);

  const preferredMode = deliveryPreference?.preferredMode;

  if (isLoading) {
    return <DonationSkeleton />;
  }

  return (
    <AnimatedPressable className="overflow-hidden rounded-2xl" {...props}>
      <Card variant="filled" className="p-0">
        <VStack>
          <Box className="bg-primary-50 relative aspect-square h-48">
            <Box className="h-full w-full overflow-hidden">
              {uri ? (
                <SingleImageViewer image={{ uri: uri, blurHash, alt }} />
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

              <Box className="relative px-2 py-1">
                <Box className="bg-primary-400 absolute inset-0" style={{ opacity: 0.8 }} />
                <Text size="xs" className="font-JakartaMedium text-white">
                  {STORAGE_TYPES[storageType || 'OTHER'].label}
                </Text>
              </Box>
            </VStack>
          </Box>

          <HStack space="sm" className="items-center p-2 pb-0">
            {preferredMode && (
              <>
                <HStack space="xs">
                  {preferredMode.map((mode, i) => (
                    <Image
                      key={i}
                      source={getDeliveryPreferenceIcon(mode)}
                      alt={`${mode} icon`}
                      style={{ width: 14, height: 14 }}
                    />
                  ))}
                </HStack>

                <Box className="border-outline-700 h-4 flex-1 border-b border-dashed" />
              </>
            )}

            {distance && (
              <HStack>
                <Icon as={BasicLocationPin} size="xs" className="fill-primary-500" />
                <Text size="xs">{distance.toFixed(2)} km</Text>
              </HStack>
            )}
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
    <Card variant="filled" className="p-0">
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
                variant="sharp"
                style={{ borderBottomRightRadius: 12 }}
              />
            </HStack>

            <Skeleton speed={2} variant="sharp" startColor="bg-primary-0" className="h-6" />
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
