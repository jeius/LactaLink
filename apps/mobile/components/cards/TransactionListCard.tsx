import { TRANSACTION_STATUS } from '@lactalink/enums';
import { Transaction, User } from '@lactalink/types';
import { extractCollection, extractID, isHospital, isMilkBank } from '@lactalink/utilities';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ComponentProps } from 'react';
import { ProfileAvatar } from '../Avatar';
import { BasicBadge } from '../badges';
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
}

export default function TransactionListCard({
  data,
  isLoading,
  onPress,
  user,
  ...cardProps
}: TransactionListCardProps) {
  const { matchedVolume, status, sender, recipient } = data || {};

  const isMeSender = extractID(user?.profile?.value) === extractID(sender?.value);
  const isMeRecipient = extractID(user?.profile?.value) === extractID(recipient?.value);

  // If meUser is sender, the other user is recipient, vice versa
  const otherUserProfile = isMeSender
    ? extractCollection(recipient?.value)
    : isMeRecipient
      ? extractCollection(sender?.value)
      : null;

  const isOtherUserOrg = otherUserProfile
    ? isHospital(otherUserProfile) || isMilkBank(otherUserProfile)
    : false;

  const title = (status && TRANSACTION_STATUS[status].label) || 'Unknown Status';
  const badgeText = isMeSender ? 'Donation' : isMeRecipient ? 'Request' : null;
  const volume = matchedVolume ? `${matchedVolume} mL` : 'N/A';
  const otherUserName =
    otherUserProfile &&
    ('name' in otherUserProfile ? otherUserProfile.name : otherUserProfile.displayName);
  const otherUserSubName = isMeSender
    ? 'Requester'
    : isMeRecipient
      ? 'Donor'
      : isOtherUserOrg
        ? 'Organization'
        : 'Individual';

  function handlePress() {
    onPress?.(data!);
  }

  return (
    <Card {...cardProps}>
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <VStack space="sm" className="items-stretch">
          <HStack space="sm" className="items-stretch justify-between">
            <VStack space="xs" className="items-start justify-stretch">
              <Text className="font-JakartaMedium shrink" ellipsizeMode="tail" numberOfLines={1}>
                {title}
              </Text>
              {badgeText && (
                <BasicBadge
                  size="md"
                  text={badgeText}
                  variant="solid"
                  action={isMeSender ? 'primary' : isMeRecipient ? 'tertiary' : 'muted'}
                />
              )}
            </VStack>

            <Text bold size="lg">
              {volume}
            </Text>
          </HStack>
          <HStack space="sm" className="justify-stretch">
            <VStack space="sm" className="flex-1 items-stretch justify-start">
              <Text size="sm" className="text-typography-800">
                {isMeSender
                  ? 'Donated to:'
                  : isMeRecipient
                    ? 'Requested from:'
                    : 'Transaction with:'}
              </Text>
              <HStack space="sm" className="items-center">
                {otherUserProfile && <ProfileAvatar size="sm" profile={otherUserProfile} />}
                {otherUserName && (
                  <VStack>
                    <Text size="xs" className="font-JakartaMedium text-typography-800">
                      {otherUserName}
                    </Text>
                    <Text size="xs" className="text-typography-700">
                      {otherUserSubName}
                    </Text>
                  </VStack>
                )}
              </HStack>
            </VStack>
            <Link href={`/transactions/${data?.id}`} asChild>
              <Button
                action="default"
                onPress={handlePress}
                className="h-fit w-fit rounded-full p-2"
              >
                <ButtonIcon as={ChevronRight} />
              </Button>
            </Link>
          </HStack>
        </VStack>
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
