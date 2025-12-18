import { BasicBadge } from '@/components/badges';
import { ProfileTag } from '@/components/ProfileTag';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTransactionState } from '@/features/transactions/hooks/useTransactionState';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction, User } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useCallback } from 'react';

interface TransactionListItemProps extends CardProps {
  data: Transaction;
  user: Pick<User, 'profile'> | null;
  onPress?: (transaction: Transaction) => void;
  showBadge?: boolean;
}

export default function TransactionListItem({
  data,
  onPress,
  user,
  showBadge = false,
  ...cardProps
}: TransactionListItemProps) {
  const { volume: matchedVolume, sender, recipient } = data || {};

  const { isUnseen } = useTransactionState(data);

  const isMeSender = isEqualProfiles(user?.profile, sender);
  const isMeRecipient = isEqualProfiles(user?.profile, recipient);

  // If meUser is sender, the other user is recipient, vice versa
  const otherUserProfile = isMeSender ? recipient : isMeRecipient ? sender : null;
  const otherUserProfileLabel = isMeSender ? 'Requester' : isMeRecipient ? 'Donor' : undefined;

  const title = matchedVolume ? `${matchedVolume} mL` : 'N/A';
  const badgeText = isMeSender ? 'Donation' : isMeRecipient ? 'Request' : null;

  const handlePress = useCallback(() => {
    onPress?.(data!);
  }, [onPress, data]);

  return (
    <Card {...cardProps}>
      <VStack space="sm" className="items-stretch">
        <HStack space="md" className="items-center">
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
          <Text size="xs" numberOfLines={1} className="shrink">
            {TRANSACTION_STATUS[data?.status || 'PENDING'].label}
          </Text>
        </HStack>
        <HStack space="sm" className="items-stretch">
          <VStack space="sm" className="flex-1 items-stretch justify-start">
            <Text size="xs">Sent to:</Text>
            {otherUserProfile && (
              <ProfileTag label={otherUserProfileLabel} profile={otherUserProfile} />
            )}
          </VStack>
          <Link href={`/transactions/${data.id}`} asChild>
            <Button onPress={handlePress} className="h-fit w-fit self-center rounded-full p-3">
              <ButtonIcon as={ChevronRight} />
            </Button>
          </Link>
        </HStack>

        {showBadge && isUnseen && (
          <Box
            className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary-500"
            style={{ transform: [{ translateY: -4 }, { translateX: 4 }] }}
          />
        )}
      </VStack>
    </Card>
  );
}

export function TransactionListItemSkeleton(props: CardProps) {
  return (
    <Card {...props}>
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
    </Card>
  );
}
