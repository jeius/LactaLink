import { Notification } from '@lactalink/types';
import { Href, Link } from 'expo-router';
import { ComponentProps } from 'react';
import { Box } from '../ui/box';
import { Button, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface NotificationListCardProps extends ComponentProps<typeof Card> {
  data?: Notification;
  isLoading?: boolean;
  onMarkedAsRead?: (item: Notification) => void;
  showBadge?: boolean;
}

export default function NotificationListCard({
  data,
  isLoading,
  onMarkedAsRead,
  showBadge = false,
  ...cardProps
}: NotificationListCardProps) {
  const isRead = data?.read || false;
  const isNotSeen = !data?.seen;

  const title = data?.title || 'Unknown Notification';
  const message = data?.message || 'No message provided';
  const date = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString('en', {
        dateStyle: 'short',
        day: '2-digit',
        dayPeriod: 'short',
      })
    : 'Unknown Date';
  const time = data?.createdAt
    ? new Date(data.createdAt).toLocaleTimeString('en', {
        timeStyle: 'short',
        hour12: true,
      })
    : 'Unknown Time';

  const actionUrl = (data?.relatedData?.actionUrl || '/+not-found') as Href;

  async function markAsRead() {
    if (!data?.id) return;
    onMarkedAsRead?.(data);
  }

  return (
    <Card {...cardProps} style={[{ opacity: isRead ? 0.75 : 1 }, cardProps.style]}>
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <VStack space="xs" className="relative items-start justify-stretch">
          <Link href={actionUrl} push asChild>
            <Button
              animateOnPress={false}
              variant="link"
              action="default"
              className="h-fit w-fit p-0"
              onPress={markAsRead}
            >
              <ButtonText underlineOnPress>{title}</ButtonText>
            </Button>
          </Link>
          <Text size="sm" className="shrink" ellipsizeMode="tail" numberOfLines={2}>
            {message}
          </Text>

          <HStack space="sm" className="w-full items-center justify-between">
            <Text
              size="xs"
              className="text-typography-700 flex-1"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {date}, {time}
            </Text>
            <Button
              isDisabled={isRead}
              size="sm"
              action="default"
              variant="link"
              onPress={markAsRead}
              className="p-0"
            >
              <ButtonText>Mark as read</ButtonText>
            </Button>
          </HStack>

          {showBadge && isNotSeen && (
            <Box className="bg-primary-500 absolute right-0 top-0 h-2 w-2 rounded-full" />
          )}
        </VStack>
      )}
    </Card>
  );
}

function CardSkeleton() {
  return (
    <VStack space="sm" className="items-start justify-stretch">
      <Skeleton variant="circular" className="h-6 w-2/3" />

      <Skeleton variant="circular" className="h-4 w-full" />
      <Skeleton variant="circular" className="h-4 w-full" />

      <HStack space="sm" className="mt-1 w-full items-center justify-between">
        <Skeleton variant="circular" className="h-3 w-32" />
        <Skeleton variant="circular" className="h-4 w-20" />
      </HStack>
    </VStack>
  );
}
