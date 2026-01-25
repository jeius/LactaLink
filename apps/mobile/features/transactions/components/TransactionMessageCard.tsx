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
import { PopulatedUserProfile } from '@lactalink/types';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection, extractName } from '@lactalink/utilities/extractors';
import React from 'react';

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
  const { data, isLoading } = useTransaction(transaction);

  if (isLoading || !data) {
    return (
      <Card {...props} size={size} variant={variant} className={cardStyle({ className })}>
        <LoadingSkeleton />
      </Card>
    );
  }

  return (
    <Card {...props} size={size} variant={variant} className={cardStyle({ className })}>
      <Content transaction={data} />
    </Card>
  );
}

function Content({ transaction: data }: { transaction: Transaction }) {
  const { data: meUser } = useMeUser();

  const deliveryDetail = extractCollection(data.deliveryDetails?.docs || [])[0];

  const isMeSender = isEqualProfiles(meUser?.profile, data?.sender);
  const otherParty = isMeSender ? data.recipient : data.sender;
  const otherPartyDoc = extractCollection(otherParty.value);

  if (!otherPartyDoc) throw new Error('Transaction sender/receiver not populated.');

  const otherPartyProfile = {
    relationTo: otherParty.relationTo,
    value: otherPartyDoc,
  } as PopulatedUserProfile;

  const message = deliveryDetail
    ? createTransactionMessage(otherPartyProfile, deliveryDetail)
    : `Communicate with ${extractName({ profile: otherParty })} regarding the delivery.`;

  return (
    <>
      <HStack space="md" className="items-start">
        <ProfileAvatar profile={otherPartyProfile} size="md" showBadge />
        <Text className="flex-1" numberOfLines={2}>
          {message}
        </Text>
      </HStack>
      {otherPartyProfile.value.owner && (
        <MessageInputButton recipient={otherPartyProfile.value.owner} />
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
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
  );
}
