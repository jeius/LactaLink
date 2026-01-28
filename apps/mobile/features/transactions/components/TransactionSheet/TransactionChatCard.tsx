import { ProfileAvatar } from '@/components/Avatar';
import { Card, CardProps } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useFindDirectChat } from '@/features/chat/hooks/queries';
import { useTransaction } from '@/features/transactions/hooks/queries';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { PopulatedUserProfile, UserProfile } from '@lactalink/types';
import { Transaction, User } from '@lactalink/types/payload-generated-types';
import {
  extractCollection,
  extractDisplayName,
  extractName,
} from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { ArrowRightIcon, MessageCircleIcon } from 'lucide-react-native';

import React, { useCallback } from 'react';
import { getOtherParty } from '../../lib/getOtherParty';

interface TransactionChatCardProps extends CardProps {
  transaction: string | Transaction;
}

const cardStyle = tva({
  base: 'flex-col items-stretch gap-4 p-4',
});

const ProfileType: Record<UserProfile['relationTo'], string> = {
  hospitals: 'Hospital',
  individuals: 'Individual',
  milkBanks: 'Milk Bank',
};

export function TransactionChatCard({
  transaction,
  className,
  variant = 'outline',
  size = 'lg',
  ...props
}: TransactionChatCardProps) {
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

function Content({ transaction: txn }: { transaction: Transaction }) {
  const otherParty = getOtherParty(txn);
  const otherPartyDoc = extractCollection(otherParty.value);

  if (!otherPartyDoc) throw new Error('Transaction sender/receiver not populated.');

  const otherPartyProfile = {
    relationTo: otherParty.relationTo,
    value: otherPartyDoc,
  } as PopulatedUserProfile;

  const otherPartyName = extractName({ profile: otherParty });

  return (
    <>
      <HStack space="md" className="items-stretch">
        <ProfileAvatar profile={otherPartyProfile} size="md" showBadge />
        <VStack className="flex-1 justify-center">
          <Text className="font-JakartaSemiBold" numberOfLines={1}>
            {extractDisplayName({ profile: otherParty })}
          </Text>
          <Text size="sm" className="text-typography-800">
            {ProfileType[otherPartyProfile.relationTo]}
          </Text>
        </VStack>
      </HStack>
      {otherPartyProfile.value.owner && (
        <MessageInputButton
          recipient={otherPartyProfile.value.owner}
          label={`Chat with ${otherPartyName}`}
        />
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <HStack space="md" className="items-stretch">
        <Skeleton variant="circular" className="h-12 w-12" />
        <VStack className="flex-1 justify-center">
          <Skeleton variant="rounded" className="h-5" />
          <Skeleton variant="rounded" className="mt-1 h-4 w-2/3" />
        </VStack>
      </HStack>
      <Skeleton variant="rounded" className="h-10 w-full" />
    </>
  );
}

function MessageInputButton({ recipient, label }: { recipient: string | User; label: string }) {
  const router = useRouter();

  const { data: conversation } = useFindDirectChat(recipient);

  const handlePress = useCallback(() => {
    if (conversation) {
      router.push(`/chat/${conversation.id}`);
    }
  }, [router, conversation]);

  if (conversation === null) {
    return null;
  }

  return (
    <Pressable
      disabled={!conversation}
      className="overflow-hidden rounded-xl"
      onPress={handlePress}
    >
      <Input size="md" pointerEvents="none" role="button">
        <InputIcon as={MessageCircleIcon} className="ml-3" />
        <InputField editable={false} placeholder={label} />
        <InputIcon as={ArrowRightIcon} className="mr-3" />
      </Input>
    </Pressable>
  );
}
