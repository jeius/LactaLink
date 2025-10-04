import { URGENCY_LEVELS } from '@lactalink/enums';
import { Request } from '@lactalink/types/payload-generated-types';
import { convertDistance, getDistance } from '@lactalink/utilities/geolib';
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
import { getDeliveryPreferenceIcon } from '@/lib/utils/getDeliveryPreferenceIcon';
import { getPriorityColor } from '@/lib/utils/getPriorityColor';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useTheme } from '../AppProvider/ThemeProvider';
import Avatar from '../Avatar';
import FastTimerIcon from '../icons/FastTimerIcon';
import { Icon } from '../ui/icon';
import { BasicLocationPin } from '../ui/icon/custom';

interface RequestCardProps extends Omit<AnimatedPressableProps, 'children'> {
  data: Request;
  isLoading?: boolean;
}

export default function RequestCard({ data, isLoading, ...props }: RequestCardProps) {
  const { location } = useCurrentLocation();
  const { theme } = useTheme();

  if (isLoading) {
    return <RequestSkeleton />;
  }

  const {
    details: { urgency, image },
    volumeNeeded,
    deliveryPreferences,
  } = data;

  const requester = extractCollection(data.requester);
  const name = requester?.displayName || requester?.givenName || 'Unknown Requester';
  const userAvatar = extractCollection(requester?.avatar);

  const requestImage = extractCollection(image);
  const uri = requestImage?.sizes?.small?.url || requestImage?.url || null;
  const blurhash = requestImage?.blurHash || BLUR_HASH;

  const preference = extractCollection(deliveryPreferences);
  const preferredMode = preference?.[0]?.preferredMode;

  const address = extractCollection(preference?.[0]?.address);
  const [latitude, longitude] = address?.coordinates || [0, 0];

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
    <AnimatedPressable className="overflow-hidden rounded-2xl" {...props}>
      <Card variant="filled" className="p-0">
        <VStack>
          <Box className="bg-tertiary-50 relative aspect-square h-48">
            <Box className="h-full w-full overflow-hidden">
              {uri ? (
                <Image
                  source={{ uri }}
                  contentFit="cover"
                  contentPosition={'center'}
                  style={{ width: '100%', height: '100%' }}
                  placeholder={{ blurhash }}
                  alt={'Request Image'}
                />
              ) : (
                <Text className="text-tertiary-900 m-auto">No Image</Text>
              )}
            </Box>

            <VStack
              className="justify-between"
              style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <HStack>
                <VStack
                  className={`px-3 py-1`}
                  style={{
                    borderBottomRightRadius: 12,
                    backgroundColor: getPriorityColor(theme, urgency, 200),
                  }}
                >
                  <Text size="2xs" style={{ color: getPriorityColor(theme, urgency, 900) }}>
                    Requesting
                  </Text>
                  <Text
                    size="xl"
                    className="font-JakartaSemiBold"
                    style={{ color: getPriorityColor(theme, urgency, 900) }}
                  >
                    {volumeNeeded}{' '}
                    <Text
                      className="font-JakartaMedium"
                      style={{ color: getPriorityColor(theme, urgency, 900) }}
                    >
                      mL
                    </Text>
                  </Text>
                </VStack>
              </HStack>

              <VStack className="relative px-2 py-1">
                <Box
                  className="absolute inset-0"
                  style={{ backgroundColor: getPriorityColor(theme, urgency), opacity: 0.8 }}
                />
                <HStack space="xs" className="items-center justify-end">
                  <Icon
                    as={FastTimerIcon}
                    fill={getPriorityColor('light', urgency, 0).toString()}
                  />
                  <Text
                    size="xs"
                    className="font-JakartaSemiBold"
                    style={{ color: getPriorityColor('light', urgency, 0) }}
                  >
                    {URGENCY_LEVELS[urgency].label}
                  </Text>
                </HStack>
              </VStack>
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

            <HStack>
              <Icon as={BasicLocationPin} size="xs" className="fill-primary-500" />
              <Text size="xs">{distance?.toFixed(2)} km</Text>
            </HStack>
          </HStack>

          <HStack space="sm" className="items-center p-2">
            <Avatar size="sm" details={{ avatar: userAvatar, name }} />
            <Text size="xs" className="flex-1">
              {name}
            </Text>
          </HStack>
        </VStack>
      </Card>
    </AnimatedPressable>
  );
}

export function RequestSkeleton() {
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
                startColor="bg-tertiary-50"
                className="h-12 w-20"
                variant="sharp"
                style={{ borderBottomRightRadius: 12 }}
              />
            </HStack>

            <Skeleton speed={2} variant="sharp" startColor="bg-tertiary-50" className="h-12" />
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
