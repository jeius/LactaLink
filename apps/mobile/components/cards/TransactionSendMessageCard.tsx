import { useMeUser } from '@/hooks/auth/useAuth';
import { useTransactionQuery } from '@/hooks/transactions/fetcher';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractName } from '@lactalink/utilities/extractors';
import React from 'react';
import { ProfileAvatar } from '../Avatar';
import { MessageInputButton } from '../buttons/MessageButton';
import { Card, CardProps } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';

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

  const isMeSender = isEqualProfiles(meUser?.profile, transaction?.sender);
  const isMeRecipient = isEqualProfiles(meUser?.profile, transaction?.recipient);

  const otherPartyProfile = isMeSender
    ? transaction?.recipient
    : isMeRecipient
      ? transaction?.sender
      : null;

  const otherPartyName = extractName({ profile: otherPartyProfile }) || 'The other user';

  return (
    <Card {...props} size={size} variant={variant} className={cardStyle({ className })}>
      <HStack space="md" className="items-start">
        <ProfileAvatar profile={otherPartyProfile} size="md" />
        <Text className="flex-1">Waiting for {otherPartyName}'s response.</Text>
      </HStack>
      <MessageInputButton recipient={otherPartyProfile} />
    </Card>
  );
}
