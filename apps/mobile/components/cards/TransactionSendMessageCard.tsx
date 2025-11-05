import { useMeUser } from '@/hooks/auth/useAuth';
import { useTransactionQuery } from '@/hooks/transactions/fetcher';
import { createTransactionMessage } from '@/lib/utils/createTransactionMessage';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractTransactionData } from '@lactalink/utilities/extractors';
import React, { useMemo } from 'react';
import { ProfileAvatar } from '../Avatar';
import { MessageInputButton } from '../buttons/MessageButton';
import { Card, CardProps } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Skeleton } from '../ui/skeleton';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

const cardStyle = tva({
  base: 'flex-col items-stretch gap-4 p-4',
});

interface TransactionSendMessageCardProps extends CardProps {
  transactionID: string;
}

export function TransactionSendMessageCard({
  transactionID,
  className,
  variant = 'outline',
  size = 'lg',
  ...props
}: TransactionSendMessageCardProps) {
  const { data: meUser } = useMeUser();
  const { data: transaction, isLoading } = useTransactionQuery(transactionID);

  const data = useMemo(() => extractTransactionData(transaction), [transaction]);

  const isMeSender = isEqualProfiles(meUser?.profile, data?.sender);
  const isMeRecipient = isEqualProfiles(meUser?.profile, data?.recipient);
  const otherPartyProfile = isMeSender ? data?.recipient : isMeRecipient ? data?.sender : null;

  const message = useMemo(
    () =>
      createTransactionMessage({
        transaction: transaction,
        otherPartyProfile: otherPartyProfile,
      }),
    [transaction, otherPartyProfile]
  );

  return (
    <Card {...props} size={size} variant={variant} className={cardStyle({ className })}>
      {isLoading ? (
        <>
          <HStack space="md" className="items-start">
            <Skeleton variant="circular" className="h-12 w-12" />
            <VStack className="flex-1">
              <Skeleton variant="rounded" className="h-5" />
              <Skeleton variant="rounded" className="mt-1 h-5 w-2/3" />
            </VStack>
          </HStack>
          <Skeleton variant="rounded" className="h-10 w-full" />
        </>
      ) : (
        <>
          <HStack space="md" className="items-start">
            <ProfileAvatar profile={otherPartyProfile} size="md" />
            <Text className="flex-1" numberOfLines={2}>
              {message}
            </Text>
          </HStack>
          <MessageInputButton recipient={otherPartyProfile} />
        </>
      )}
    </Card>
  );
}
