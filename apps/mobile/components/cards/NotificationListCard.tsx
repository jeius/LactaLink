import { Notification } from '@lactalink/types';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ComponentProps } from 'react';
import { Button, ButtonIcon } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface NotificationListCardProps extends ComponentProps<typeof Card> {
  data?: Notification;
  isLoading?: boolean;
  onPress?: (notification: Notification) => void;
}

export default function NotificationListCard({
  data,
  isLoading,
  onPress,
  ...cardProps
}: NotificationListCardProps) {
  const title = data?.title || 'Unknown Notification';
  const message = data?.message || 'No message provided';
  const read = data?.read;
  const timeStamp = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString('en', {
        dateStyle: 'short',
        day: '2-digit',
        dayPeriod: 'short',
      })
    : 'Unknown Date';

  function handlePress() {
    onPress?.(data!);
  }

  return (
    <Card {...cardProps} style={{ opacity: read ? 0.75 : 1 }}>
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <HStack space="sm" className="items-center justify-between">
          <VStack space="xs" className="items-start justify-stretch">
            <Text className="font-JakartaMedium shrink" ellipsizeMode="tail" numberOfLines={1}>
              {title}
            </Text>
            <Text size="sm" className="shrink" ellipsizeMode="tail" numberOfLines={1}>
              {message}
            </Text>
            <Text
              size="xs"
              className="text-typography-700 shrink"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {timeStamp}
            </Text>
          </VStack>
          <Link href={`/transactions/${data?.id}`} asChild>
            <Button action="default" onPress={handlePress} className="h-fit w-fit rounded-full p-2">
              <ButtonIcon as={ChevronRight} />
            </Button>
          </Link>
        </HStack>
      )}
    </Card>
  );
}

function CardSkeleton() {
  return (
    <VStack space="sm" className="items-stretch">
      <HStack space="sm" className="items-stretch justify-between">
        <VStack space="xs" className="items-start justify-stretch">
          <Skeleton variant="rounded" className="h-6 w-40" />
          <Skeleton variant="rounded" className="h-6 w-24" />
        </VStack>

        <Skeleton variant="rounded" className="h-8 w-20" />
      </HStack>
      <HStack space="sm" className="justify-stretch">
        <VStack space="sm" className="flex-1 items-stretch justify-start">
          <Skeleton variant="circular" className="h-4 w-24" />
          <HStack space="sm" className="items-center">
            <Skeleton variant="circular" className="h-8 w-8" />
            <VStack space="xs">
              <Skeleton variant="circular" className="h-3 w-32" />
              <Skeleton variant="circular" className="h-3 w-16" />
            </VStack>
          </HStack>
        </VStack>

        <Skeleton variant="circular" className="h-10 w-10" />
      </HStack>
    </VStack>
  );
}
