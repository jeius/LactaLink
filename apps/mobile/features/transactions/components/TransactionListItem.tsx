import { AnimatedPressable } from '@/components/animated/pressable';
import { BasicBadge } from '@/components/badges';
import { ProfileTag } from '@/components/ProfileTag';
import { Box } from '@/components/ui/box';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTransactionState } from '@/features/transactions/hooks/useTransactionState';
import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction, User } from '@lactalink/types/payload-generated-types';
import { displayVolume } from '@lactalink/utilities';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { ChevronRightIcon } from 'lucide-react-native';
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

  const isSender = isEqualProfiles(user?.profile, sender);
  const isRecipient = isEqualProfiles(user?.profile, recipient);

  // If user is sender, the other user is recipient, vice versa
  const otherUserProfile = isSender ? recipient : isRecipient ? sender : null;
  const otherUserProfileLabel = isSender ? 'Requester' : isRecipient ? 'Donor' : undefined;

  const title = matchedVolume ? displayVolume(matchedVolume) : 'N/A';
  const badgeText = isSender ? 'Donation' : isRecipient ? 'Request' : null;

  const handlePress = useCallback(() => {
    onPress?.(data!);
  }, [onPress, data]);

  return (
    <AnimatedPressable onPress={handlePress} className="overflow-hidden rounded-2xl">
      <Card {...cardProps}>
        <VStack className="items-stretch">
          <HStack space="sm" className="items-center">
            <Text
              size="xl"
              className="flex-1 font-JakartaExtraBold"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {title}
            </Text>
            {badgeText && (
              <BasicBadge
                size="xs"
                text={badgeText}
                variant="solid"
                action={isSender ? 'primary' : isRecipient ? 'tertiary' : 'muted'}
              />
            )}
          </HStack>

          <Text size="xs" numberOfLines={1} className="shrink font-JakartaMedium">
            {TRANSACTION_STATUS[data?.status || 'PENDING'].label}
          </Text>

          <HStack space="sm" className="mt-2 items-stretch">
            <VStack space="sm" className="flex-1 items-stretch justify-start">
              {otherUserProfile && (
                <ProfileTag label={otherUserProfileLabel} profile={otherUserProfile} />
              )}
            </VStack>
            <Icon as={ChevronRightIcon} />
          </HStack>

          {showBadge && isUnseen && (
            <Box
              className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary-500"
              style={{ transform: [{ translateY: -4 }, { translateX: 4 }] }}
            />
          )}
        </VStack>
      </Card>
    </AnimatedPressable>
  );
}
