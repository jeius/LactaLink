import { Transaction, User } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ComponentProps } from 'react';
import { BasicBadge } from '../badges';
import { ProfileTag } from '../ProfileTag';
import { Box } from '../ui/box';
import { Button, ButtonIcon } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface TransactionListCardProps extends ComponentProps<typeof Card> {
  data?: Transaction;
  user: Pick<User, 'profile'> | null;
  isLoading?: boolean;
  onPress?: (transaction: Transaction) => void;
  showBadge?: boolean;
}

export default function TransactionListCard({
  data,
  isLoading,
  onPress,
  user,
  showBadge = false,
  ...cardProps
}: TransactionListCardProps) {
  const { matchedVolume, sender, recipient } = data || {};

  const isNotSeen = !data?.seen;
  const isMeSender = extractID(user?.profile?.value) === extractID(sender?.value);
  const isMeRecipient = extractID(user?.profile?.value) === extractID(recipient?.value);

  // If meUser is sender, the other user is recipient, vice versa
  const otherUserProfile = isMeSender ? recipient : isMeRecipient ? sender : null;
  const otherUserProfileLabel = isMeSender ? 'Requester' : isMeRecipient ? 'Donor' : undefined;

  const title = matchedVolume ? `${matchedVolume} mL` : 'N/A';
  const badgeText = isMeSender ? 'Donation' : isMeRecipient ? 'Request' : null;

  function handlePress() {
    onPress?.(data!);
  }

  return (
    <Card {...cardProps}>
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <VStack space="sm" className="items-stretch">
          <HStack space="sm" className="flex-1 items-start">
            <Text bold size="xl" className="shrink" ellipsizeMode="tail" numberOfLines={1}>
              {title}
            </Text>
            {badgeText && (
              <BasicBadge
                size="xs"
                text={badgeText}
                variant="solid"
                action={isMeSender ? 'primary' : isMeRecipient ? 'tertiary' : 'muted'}
              />
            )}
          </HStack>
          <HStack space="sm" className="items-stretch">
            <VStack space="sm" className="flex-1 items-stretch justify-start">
              <Text size="xs">Sent to:</Text>
              {otherUserProfile && (
                <ProfileTag label={otherUserProfileLabel} profile={otherUserProfile} />
              )}
            </VStack>
            <Link href={`/transactions/${data?.id}`} asChild>
              <Button
                onPress={handlePress}
                className="h-fit w-fit self-center rounded-full p-3"
                isDisabled={!data?.id}
              >
                <ButtonIcon as={ChevronRight} />
              </Button>
            </Link>
          </HStack>

          {showBadge && isNotSeen && (
            <Box
              className="bg-primary-500 absolute right-0 top-0 h-2 w-2 rounded-full"
              style={{ transform: [{ translateY: -4 }, { translateX: 4 }] }}
            />
          )}
        </VStack>
      )}
    </Card>
  );
}

function CardSkeleton() {
  return (
    <VStack space="sm" className="items-stretch">
      <Skeleton variant="rounded" className="h-6 w-40" />
      <HStack space="sm" className="justify-stretch">
        <VStack space="sm" className="flex-1 items-stretch justify-start">
          <Skeleton variant="circular" className="h-4 w-16" />
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
