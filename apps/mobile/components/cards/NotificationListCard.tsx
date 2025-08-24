import { getApiClient } from '@lactalink/api';
import { Notification } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities';
import { useRecyclingState } from '@shopify/flash-list';
import { Href, Link } from 'expo-router';
import { ComponentProps } from 'react';
import { toast } from 'sonner-native';
import { Button, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface NotificationListCardProps extends ComponentProps<typeof Card> {
  data?: Notification;
  isLoading?: boolean;
}

export default function NotificationListCard({
  data,
  isLoading,
  ...cardProps
}: NotificationListCardProps) {
  const [isRead, setIsRead] = useRecyclingState(data?.read || false, [data?.id]);

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
    setIsRead(true);

    if (!data?.id) return;

    const apiClient = getApiClient();
    await apiClient
      .updateByID({
        collection: 'notifications',
        id: data.id,
        data: { read: true },
        depth: 0,
      })
      .catch((error) => {
        toast.error(extractErrorMessage(error));
        setIsRead(false);
      });
  }

  return (
    <Card {...cardProps} style={{ opacity: isRead ? 0.75 : 1 }}>
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <VStack space="xs" className="items-start justify-stretch">
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
