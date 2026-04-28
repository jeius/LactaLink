import TruncatedText from '@/components/TruncatedText';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Notification } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { formatDate, formatLocaleTime } from '@lactalink/utilities/formatters';
import { Href, Link } from 'expo-router';
import { FC } from 'react';

function CardSkeleton(props: CardProps) {
  return (
    <Card {...props}>
      <VStack space="sm" className="items-start justify-stretch">
        <Skeleton variant="sharp" className="h-6 w-2/3" />

        <Skeleton variant="sharp" className="h-4 w-full" />
        <Skeleton variant="sharp" className="h-4 w-full" />

        <HStack space="sm" className="mt-1 w-full items-center justify-between">
          <Skeleton variant="sharp" className="h-3 w-32" />
          <Skeleton variant="sharp" className="h-4 w-20" />
        </HStack>
      </VStack>
    </Card>
  );
}

interface NotificationCardProps extends CardProps {
  data: Notification;
  onMarkedAsRead?: (item: Notification) => void;
  showBadge?: boolean;
}

function ListCard({
  data,
  onMarkedAsRead,
  showBadge = false,
  ...cardProps
}: NotificationCardProps) {
  const isRead = data?.read || false;
  const isNotSeen = !data?.seen;

  const title = data?.title || 'Unknown Notification';
  const message = data?.message || 'No message provided';
  const date = data?.createdAt ? formatDate(data.createdAt, { shortMonth: true }) : 'Unknown Date';
  const time = data?.createdAt ? formatLocaleTime(data.createdAt) : 'Unknown Time';

  const relatedEntity = data?.relatedData?.data;
  const actionUrl = relatedEntity
    ? (`/${relatedEntity.relationTo}/${extractID(relatedEntity.value)}` as Href)
    : null;

  async function markAsRead() {
    if (!data?.id) return;
    onMarkedAsRead?.(data);
  }

  return (
    <Card {...cardProps}>
      <VStack space="xs" style={{ opacity: isRead ? 0.7 : 1 }}>
        {!actionUrl ? (
          <Text size="md" bold>
            {title}
          </Text>
        ) : (
          <Link href={actionUrl} asChild push>
            <Button variant="link" action="default" hitSlop={8} className="h-fit self-start p-0">
              <ButtonText className="font-JakartaBold">{title}</ButtonText>
            </Button>
          </Link>
        )}

        <TruncatedText size="sm" containerClassName="flex-1" initialLines={2}>
          {message}
        </TruncatedText>

        <HStack space="sm" className="items-center justify-between">
          <Text
            size="xs"
            className="flex-1 text-typography-700"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {date}, {time}
          </Text>
          <Button
            size="sm"
            action="default"
            variant="ghost"
            isDisabled={isRead}
            disablePressAnimation
            onPress={markAsRead}
          >
            <ButtonText>Mark as read</ButtonText>
          </Button>
        </HStack>

        {showBadge && isNotSeen && (
          <Box className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary-500" />
        )}
      </VStack>
    </Card>
  );
}

const NotificationCard = ListCard as FC<NotificationCardProps> & {
  Skeleton: typeof CardSkeleton;
};
NotificationCard.displayName = 'NotificationListCard';
NotificationCard.Skeleton = CardSkeleton;

export default NotificationCard;
