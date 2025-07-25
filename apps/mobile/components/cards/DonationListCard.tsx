import { useAuth } from '@/hooks/auth/useAuth';
import { getHexColor } from '@/lib/colors';
import { COLLECTION_MODES, DONATION_STATUS, PREFERRED_STORAGE_TYPES } from '@/lib/constants';
import { Donation, Image as ImageType } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { useRouter } from 'expo-router';
import { DropletIcon, EditIcon, MilkIcon, PackageIcon } from 'lucide-react-native';
import React from 'react';
import { GestureResponderEvent } from 'react-native';
import { useTheme } from '../AppProvider/ThemeProvider';
import { BasicBadge, BasicBadgeProps } from '../badges';
import { Image } from '../Image';
import { Box } from '../ui/box';
import { Button, ButtonIcon } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export interface DonationListCardProps extends React.ComponentProps<typeof Card> {
  data: Donation;
  isLoading?: boolean;
}

export function DonationListCard({ data, isLoading, ...props }: DonationListCardProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { profile } = useAuth();

  const fillColor = getHexColor(theme, 'primary', 50)?.toString();
  const strokeColor = getHexColor(theme, 'primary', 700)?.toString();

  if (isLoading) {
    return (
      <Card {...props}>
        <CardSkeleton />
      </Card>
    );
  }

  const { details, status, volume, remainingVolume, donor } = data;
  const { collectionMode, storageType } = details;

  const milkSamples = details.milkSample as ImageType[] | null;
  const image = milkSamples && milkSamples.length ? milkSamples[0] : null;
  const imageUrl = image?.sizes?.thumbnail?.url || image?.url;

  const isOwner = profile?.id === extractID(donor);

  let finalVolume: number;
  let badgeAction: BasicBadgeProps['action'] = 'success';

  switch (status) {
    case 'AVAILABLE':
      badgeAction = 'success';
      finalVolume = remainingVolume || 0;
      break;
    case 'PARTIALLY_ALLOCATED':
      badgeAction = 'warning';
      finalVolume = remainingVolume || 0;
      break;
    case 'FULLY_ALLOCATED':
      badgeAction = 'info';
      finalVolume = volume || 0;
      break;
    case 'COMPLETED':
      badgeAction = 'info';
      finalVolume = volume || 0;
      break;
    case 'EXPIRED':
      badgeAction = 'error';
      finalVolume = volume || 0;
      break;
    case 'CANCELLED':
      badgeAction = 'muted';
      finalVolume = volume || 0;
      break;
    default:
      finalVolume = volume || 0;
      badgeAction = 'muted';
      break;
  }

  function handleEditAction(e: GestureResponderEvent) {
    e.stopPropagation();
    router.push(`/donations/edit/${data.id}`);
  }

  return (
    <Card {...props}>
      <HStack space="sm" className="w-full items-start">
        <Box
          className="bg-primary-50 overflow-hidden rounded-md"
          style={{ width: 92, aspectRatio: 1 }}
        >
          {imageUrl ? (
            <Image
              recyclingKey={imageUrl}
              source={{ uri: imageUrl }}
              alt="Milk sample"
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <Text size="xs" className="my-auto text-center">
              No Image
            </Text>
          )}
        </Box>

        <VStack space="xs" className="flex-1 items-start">
          <HStack space="xs" className="items-center">
            <Icon size="sm" as={MilkIcon} fill={fillColor} stroke={strokeColor} />
            <Text className="font-JakartaSemiBold" numberOfLines={1} ellipsizeMode="tail">
              {finalVolume} mL
            </Text>
          </HStack>

          <HStack space="xs" className="items-center">
            <Icon size="sm" as={PackageIcon} fill={fillColor} stroke={strokeColor} />
            <Text size="sm" numberOfLines={1} ellipsizeMode="tail">
              {PREFERRED_STORAGE_TYPES[storageType].label}
            </Text>
          </HStack>

          <HStack space="xs" className="items-center">
            <Icon size="sm" as={DropletIcon} fill={fillColor} stroke={strokeColor} />
            <Text size="sm">{COLLECTION_MODES[collectionMode || 'MANUAL'].label}</Text>
          </HStack>

          <BasicBadge size="sm" action={badgeAction} text={DONATION_STATUS[status].label} />
        </VStack>

        {isOwner && (
          <VStack>
            <Button
              action="default"
              variant="link"
              className="h-fit w-fit p-0"
              onPress={handleEditAction}
              hitSlop={8}
            >
              <ButtonIcon as={EditIcon} />
            </Button>
          </VStack>
        )}
      </HStack>
    </Card>
  );
}

function CardSkeleton() {
  return (
    <HStack space="sm" className="w-full items-start">
      <Skeleton style={{ width: 92, aspectRatio: 1 }} />

      <VStack space="xs" className="flex-1 items-start">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-16" />
      </VStack>

      <VStack>
        <Skeleton className="h-10 w-10" />
      </VStack>
    </HStack>
  );
}
