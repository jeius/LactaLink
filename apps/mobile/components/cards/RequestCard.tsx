import { PRIORITY_LEVELS } from '@/lib/constants';
import {
  Address,
  Avatar as AvatarType,
  DeliveryPreference,
  Image as ImageType,
  Individual,
  Request,
} from '@lactalink/types';
import { convertDistance, formatDate, getDistance } from '@lactalink/utilities';
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
import { useTheme } from '../AppProvider/ThemeProvider';
import Avatar from '../Avatar';
import BasicLocationPin from '../icons/BasicLocationPin';
import { Icon } from '../ui/icon';

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
    details: { urgency, image, neededAt },
    volumeNeeded,
    requester,
    deliveryDetails,
  } = data;

  const name =
    (requester as Individual)?.displayName ||
    (requester as Individual)?.givenName ||
    'Unknown Donor';
  const userAvatar = (requester as Individual)?.avatar as AvatarType | null;

  const requestImage = image as ImageType | null;
  const imageUrl = requestImage?.sizes?.medium?.url || requestImage?.url || null;

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
      <Card variant="filled" className="p-0">
        <VStack>
          <Box className="bg-tertiary-50 relative aspect-square h-48">
            <Box className="h-full w-full overflow-hidden">
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  contentFit="cover"
                  contentPosition={'center'}
                  style={{ width: '100%', height: '100%' }}
                  placeholder={{ blurhash: BLUR_HASH }}
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
                  className={`bg-tertiary-300 px-3 py-1`}
                  style={{ borderBottomRightRadius: 12 }}
                >
                  <Text size="2xs" className="text-tertiary-900">
                    Requesting
                  </Text>
                  <Text size="xl" className="font-JakartaSemiBold text-tertiary-900">
                    {volumeNeeded}{' '}
                    <Text size="xs" className="font-JakartaMedium text-tertiary-900">
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
                <Text size="xs" className="font-JakartaLight text-white">
                  Urgency:{' '}
                  <Text size="xs" className="font-JakartaMedium text-white">
                    {PRIORITY_LEVELS[urgency].label}
                  </Text>
                </Text>
                <Text size="xs" className="font-JakartaLight text-white">
                  Needed At:{' '}
                  <Text size="xs" className="font-JakartaMedium text-white">
                    {formatDate(neededAt)}
                  </Text>
                </Text>
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
