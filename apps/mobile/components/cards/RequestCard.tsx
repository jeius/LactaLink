import { PRIORITY_LEVELS } from '@/lib/constants';
import { Avatar as AvatarType, Image as ImageType, Individual, Request } from '@lactalink/types';
import { formatDate } from '@lactalink/utilities';
import React from 'react';
import { AnimatedPressable, AnimatedPressableProps } from '../animated/pressable';
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from '../ui/avatar';
import { Box } from '../ui/box';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

import { Image } from '@/components/Image';
import { BLUR_HASH } from '@/lib/constants/images';

const priorityLevelColors: Record<keyof typeof PRIORITY_LEVELS, string> = {
  LOW: 'bg-success-400',
  MEDIUM: 'bg-secondary-400',
  HIGH: 'bg-warning-400',
  CRITICAL: 'bg-error-400',
};

interface RequestCardProps extends Omit<AnimatedPressableProps, 'children'> {
  data: Request;
}

export default function RequestCard({ data, ...props }: RequestCardProps) {
  const {
    details: { urgency, image, neededAt },
    volumeNeeded,
    requester,
  } = data;

  const name =
    (requester as Individual)?.displayName ||
    (requester as Individual)?.givenName ||
    'Unknown Donor';
  const userAvatar = (requester as Individual)?.avatar as AvatarType | null;

  const requestImage = image as ImageType | null;
  const imageUrl = requestImage?.sizes?.medium?.url || requestImage?.url || null;

  return (
    <AnimatedPressable {...props}>
      <Card className="p-0">
        <VStack space="md">
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
                  className={`bg-tertiary-300 px-2 py-1`}
                  style={{ borderBottomRightRadius: 12 }}
                >
                  <Text size="2xs" className="text-tertiary-900">
                    Needed At
                  </Text>
                  <Text size="sm" className={`font-JakartaMedium text-tertiary-900`}>
                    {formatDate(neededAt)}
                  </Text>
                </VStack>
              </HStack>

              <VStack className="items-center">
                <Box
                  className={`bg-tertiary-300 flex-col items-center rounded-lg px-3 py-2 opacity-90`}
                  style={{ minWidth: 90 }}
                >
                  <Text size="xs" className="text-tertiary-900">
                    Requesting
                  </Text>
                  <Text size="2xl" className="font-JakartaSemiBold text-tertiary-900">
                    {volumeNeeded}{' '}
                    <Text size="sm" className="font-JakartaMedium text-tertiary-900">
                      mL
                    </Text>
                  </Text>
                </Box>
              </VStack>

              <Text
                size="xs"
                className={`${priorityLevelColors[urgency]} font-JakartaMedium text-background-light px-2 py-1 opacity-90`}
              >
                Urgency: {PRIORITY_LEVELS[urgency].label}
              </Text>
            </VStack>
          </Box>

          <HStack space="sm" className="items-center p-2">
            <Avatar size="sm">
              <AvatarFallbackText>{name}</AvatarFallbackText>
              {userAvatar?.thumbnailURL && (
                <AvatarImage
                  alt={userAvatar?.alt || 'Avatar'}
                  source={{ uri: userAvatar?.thumbnailURL }}
                />
              )}
              <AvatarBadge />
            </Avatar>
            <Text size="xs" className="flex-1 flex-wrap">
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
    <Card className="p-0">
      <VStack space="md">
        <Box className="bg-background-muted relative aspect-square h-48">
          <Box className="h-full w-full overflow-hidden">
            <Skeleton startColor="bg-background-400" speed={4} />
          </Box>

          <VStack
            className="justify-between"
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          >
            <HStack>
              <Skeleton
                speed={4}
                startColor="bg-background-300"
                className="h-6 w-16"
                style={{ borderBottomRightRadius: 12 }}
              />
            </HStack>

            <VStack className="items-center">
              <Skeleton
                speed={4}
                startColor="bg-background-300"
                className="h-12 w-20"
                variant="rounded"
              />
            </VStack>

            <Skeleton speed={4} startColor="bg-background-300" className="h-6" />
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
