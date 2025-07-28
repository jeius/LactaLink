import { getHexColor } from '@/lib/colors';
import { PREFERRED_STORAGE_TYPES, REQUEST_VOLUME_STATUS, URGENCY_LEVELS } from '@/lib/constants';
import { getPriorityColor } from '@/lib/utils/getPriorityColor';
import { Image as ImageType, Request } from '@lactalink/types';
import { useRouter } from 'expo-router';
import { EditIcon, MilkIcon, PackageIcon } from 'lucide-react-native';
import React from 'react';
import { GestureResponderEvent } from 'react-native';
import { useTheme } from '../AppProvider/ThemeProvider';
import { BasicBadge, BasicBadgeProps } from '../badges';
import FastTimerIcon from '../icons/FastTimerIcon';
import { Image } from '../Image';
import { Box } from '../ui/box';
import { Button, ButtonIcon } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Icon } from '../ui/icon';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export interface RequestListCardProps extends React.ComponentProps<typeof Card> {
  data: Request;
  isLoading?: boolean;
  showEditButton?: boolean;
}

export function RequestListCard({
  data,
  isLoading,
  showEditButton = false,
  ...props
}: RequestListCardProps) {
  const router = useRouter();
  const { theme } = useTheme();

  const fillColor = getHexColor(theme, 'primary', 50)?.toString();
  const strokeColor = getHexColor(theme, 'primary', 700)?.toString();

  if (isLoading) {
    return (
      <Card {...props}>
        <CardSkeleton />
      </Card>
    );
  }

  const { details, volumeNeeded, volumeStatus, volumeFulfilled } = data;
  const { urgency, storagePreference } = details;

  const image = details.image as ImageType | null;
  const imageUrl = image?.sizes?.thumbnail?.url || image?.url;

  let badgeAction: BasicBadgeProps['action'] = 'success';
  let canEdit: boolean = false;
  const finalVolume = volumeNeeded - (volumeFulfilled || 0);

  switch (volumeStatus) {
    case 'UNFULFILLED':
      badgeAction = 'success';
      canEdit = true;
      break;
    case 'PARTIALLY_FULFILLED':
      badgeAction = 'warning';
      break;
    case 'FULFILLED':
      badgeAction = 'info';
      break;
    default:
      badgeAction = 'muted';
      break;
  }

  function handleEditAction(e: GestureResponderEvent) {
    e.stopPropagation();
    router.push(`/requests/edit/${data.id}`);
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
              alt="Recipient Image"
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
              {PREFERRED_STORAGE_TYPES[storagePreference || 'EITHER'].label}
            </Text>
          </HStack>

          <HStack space="xs" className="items-center">
            <Icon
              size="sm"
              as={FastTimerIcon}
              fill={getPriorityColor(theme, urgency)?.toString()}
            />
            <Text size="sm" style={{ color: getPriorityColor(theme, urgency) }}>
              {URGENCY_LEVELS[urgency || 'LOW'].label}
            </Text>
          </HStack>

          <BasicBadge
            size="sm"
            action={badgeAction}
            text={REQUEST_VOLUME_STATUS[volumeStatus].label}
          />
        </VStack>

        <VStack>
          {showEditButton && canEdit && (
            <Button
              action="default"
              variant="link"
              className="h-fit w-fit p-0"
              onPress={handleEditAction}
              hitSlop={8}
            >
              <ButtonIcon as={EditIcon} />
            </Button>
          )}
        </VStack>
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
