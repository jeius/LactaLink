import { ProfileAvatar } from '@/components/Avatar';
import { MessageInputButton } from '@/components/buttons/MessageButton';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTransaction } from '@/features/transactions/hooks/queries';
import { useMeUser } from '@/hooks/auth/useAuth';
import { createTransactionMessage } from '@/lib/utils/createTransactionMessage';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractTransactionData } from '@lactalink/utilities/extractors';
import React, { useMemo } from 'react';

const cardStyle = tva({
  base: 'flex-col items-stretch gap-4 p-4',
});

interface TransactionMessageCardProps extends CardProps {
  transaction: string | Transaction;
}

export function TransactionMessageCard({
  transaction,
  className,
  variant = 'outline',
  size = 'lg',
  ...props
}: TransactionMessageCardProps) {
  const { data: meUser } = useMeUser();
  const { isLoading, ...query } = useTransaction(transaction);

  const data = useMemo(() => extractTransactionData(query.data), [query.data]);

  const isMeSender = isEqualProfiles(meUser?.profile, data?.sender);
  const isMeRecipient = isEqualProfiles(meUser?.profile, data?.recipient);
  const otherPartyProfile = isMeSender ? data?.recipient : isMeRecipient ? data?.sender : null;

  const message = useMemo(
    () =>
      createTransactionMessage({
        transaction: query.data,
        otherPartyProfile: otherPartyProfile,
      }),
    [query.data, otherPartyProfile]
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
        otherPartyProfile && (
          <>
            <HStack space="md" className="items-start">
              <ProfileAvatar profile={otherPartyProfile} size="md" />
              <Text className="flex-1" numberOfLines={2}>
                {message}
              </Text>
            </HStack>
            <MessageInputButton recipient={otherPartyProfile} />
          </>
        )
      )}
    </Card>
  );
}
