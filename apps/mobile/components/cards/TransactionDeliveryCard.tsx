import { useMeUser } from '@/hooks/auth/useAuth';
import { useDeliveryMutations } from '@/hooks/mutations/useDeliveryMutations';
import { useTransactionQuery } from '@/hooks/transactions/fetcher';
import { getLottieAsset } from '@/lib/stores/assetsStore';
import { getLatestDeliveryProposal } from '@/lib/utils/getLatestDeliveryProposal';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DELIVERY_OPTIONS, TRANSACTION_STATUS } from '@lactalink/enums';
import { ProposedDelivery, Transaction, User } from '@lactalink/types/payload-generated-types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import isEqual from 'lodash/isEqual';
import LottieView, { AnimationObject } from 'lottie-react-native';
import { CheckIcon, MessageCircleIcon, XIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ProfileAvatar } from '../Avatar';
import { ActionModal } from '../modals';
import { Box, BoxProps } from '../ui/box';
import { Button, ButtonIcon, ButtonProps, ButtonText } from '../ui/button';
import { Card } from '../ui/card';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { DeliveryCard } from './DeliveryCard';

const MATCHED = TRANSACTION_STATUS.MATCHED.value;
const PENDING = TRANSACTION_STATUS.PENDING_DELIVERY_CONFIRMATION.value;
const SCHEDULED = TRANSACTION_STATUS.DELIVERY_SCHEDULED.value;
const DELIVERY = DELIVERY_OPTIONS.DELIVERY.value;

const ANIMATED_ICON: Record<Transaction['status'], { source: AnimationObject }> = {
  MATCHED: { source: getLottieAsset('timeLoader') },
  PENDING_DELIVERY_CONFIRMATION: { source: getLottieAsset('timeLoader') },
  COMPLETED: { source: getLottieAsset('success') },
  CANCELLED: { source: getLottieAsset('success') },
  DELIVERED: { source: getLottieAsset('receivePackage') },
  READY_FOR_PICKUP: { source: getLottieAsset('receivePackage') },
  DELIVERY_SCHEDULED: { source: getLottieAsset('orderPacked') },
  IN_TRANSIT: { source: getLottieAsset('areaMap') },
  FAILED: { source: getLottieAsset('success') },
};

const agreementsAvatarStyle = tva({
  base: 'bg-background-300 border-background-300 aspect-square w-10 rounded-full border-2',
  variants: {
    agreed: {
      true: 'border-success-400',
      false: 'border-error-400',
      undefined: 'border-background-300',
    },
  },
});

const statusBadgeStyle = tva({
  base: 'bg-primary-0 border-primary-500 h-20 w-20 items-center justify-center rounded-full border-2',
});

interface DeliveryCardProps {
  transactionID: string;
}

export function TransactionDeliveryCard({ transactionID }: DeliveryCardProps) {
  const { data: meUser } = useMeUser();
  const { data: transaction, queryKey } = useTransactionQuery(transactionID);

  const isUserSender = isEqual(transaction?.sender, meUser?.profile);
  const isUserRecipient = isEqual(transaction?.recipient, meUser?.profile);

  const messageRecipient = isUserSender
    ? transaction?.recipient
    : isUserRecipient
      ? transaction?.sender
      : undefined;

  const { status = MATCHED, delivery: { confirmed } = {} } = transaction || {};

  const { latestProposal } = useMemo(() => extractData(transaction), [transaction]);

  return (
    <Card className="flex-col items-stretch gap-2 overflow-visible p-4">
      <Text bold size="lg" className="text-primary-600 mb-2">
        {TRANSACTION_STATUS[status].label}...
      </Text>

      {status === SCHEDULED && confirmed ? (
        <>
          <DeliveryCard data={confirmed} className="gap-1" size="lg" />
          <MessageButton recipient={messageRecipient} className="mt-2" />
        </>
      ) : status === PENDING && latestProposal ? (
        <>
          <ProposalInformation {...latestProposal} />
          {transaction && (
            <ProposalCTA proposal={latestProposal} transaction={transaction} queryKey={queryKey} />
          )}
        </>
      ) : (
        <>
          <Text>No delivery location and method proposed yet.</Text>
          <HStack space="sm">
            <Link
              asChild
              push
              href={{ pathname: '/delivery-proposal', params: { id: transactionID } }}
            >
              <Button size="sm" className="flex-1">
                <ButtonText numberOfLines={1}>Propose</ButtonText>
              </Button>
            </Link>
            <MessageButton recipient={messageRecipient} />
          </HStack>
        </>
      )}

      <StatusBadge
        status={status}
        className="absolute right-0 top-0"
        style={{ transform: [{ translateY: -24 }, { translateX: 12 }] }}
      />
    </Card>
  );
}

function StatusBadge({
  status,
  className,
  ...props
}: { status: Transaction['status'] } & BoxProps) {
  return (
    <Box {...props} className={statusBadgeStyle({ className })}>
      <LottieView
        autoPlay
        loop
        source={ANIMATED_ICON[status].source}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </Box>
  );
}

function ProposalInformation({
  id,
  address,
  datetime,
  mode,
  agreements: { recipient, sender } = {},
  instructions,
}: NonNullable<ProposedDelivery>[number]) {
  const { data: meUser } = useMeUser();
  const isUserSender = isEqual(sender?.agreedBy, meUser?.profile);
  const isUserRecipient = isEqual(recipient?.agreedBy, meUser?.profile);

  const messageRecipient = isUserSender
    ? recipient?.agreedBy
    : isUserRecipient
      ? sender?.agreedBy
      : undefined;

  const parties = [sender, recipient].filter((v) => v !== undefined);

  return (
    <>
      {/* <DeliveryInformation address={address} datetime={datetime} mode={mode} /> */}
      <DeliveryCard
        data={{
          address: address,
          datetime: datetime,
          mode: mode,
          instructions: instructions,
        }}
        className="gap-1"
        size="lg"
      />

      <HStack space="md" className="mt-2 items-end justify-between">
        <VStack space="xs">
          <Text size="xs" className="font-JakartaSemiBold">
            Agreed:
          </Text>
          <HStack space="sm" className="items-center">
            {parties.map(({ agreed, agreedBy }, idx) => (
              <Box
                key={idx}
                className={agreementsAvatarStyle({
                  agreed: agreedBy === undefined ? undefined : !!agreed,
                })}
              >
                {agreedBy && <ProfileAvatar className="h-full w-full" profile={agreedBy} />}
              </Box>
            ))}
          </HStack>
        </VStack>

        <MessageButton recipient={messageRecipient} />
      </HStack>
    </>
  );
}

interface ProposalCTAProps {
  proposal: NonNullable<ProposedDelivery>[number];
  transaction: Transaction;
  queryKey: unknown[];
}

function ProposalCTA({ proposal, transaction, queryKey }: ProposalCTAProps) {
  const { data: meUser } = useMeUser();
  const { agreeMutation, disagreeMutation } = useDeliveryMutations(transaction, queryKey);

  const isUserSender = isEqual(proposal.agreements?.sender?.agreedBy, meUser?.profile);
  const isUserRecipient = isEqual(proposal.agreements?.recipient?.agreedBy, meUser?.profile);

  const senderAgreed = proposal.agreements?.sender?.agreed;
  const recipientAgreed = proposal.agreements?.recipient?.agreed;

  const disableAgreeButton = (isUserSender && senderAgreed) || (isUserRecipient && recipientAgreed);
  const disableRejectButton =
    (isUserSender && senderAgreed === false) || (isUserRecipient && recipientAgreed === false);

  function handleAgree() {
    if (!proposal.id) {
      console.warn('Unable to agree to proposal: Missing proposal ID');
      return;
    }
    agreeMutation.mutateAsync(proposal.id);
  }

  function handleReject() {
    if (!proposal.id) {
      console.warn('Unable to reject proposal: Missing proposal ID');
      return;
    }
    disagreeMutation.mutateAsync(proposal.id);
  }

  return (
    <HStack space="md" className="mt-4 items-stretch">
      <ActionModal
        variant="outline"
        action="positive"
        title="Confirm Agreement"
        description="Are you sure you want to agree to this delivery option?"
        triggerIcon={CheckIcon}
        isDisabled={!!disableAgreeButton}
        iconOnly
        confirmLabel="Agree"
        onConfirm={handleAgree}
      />

      <Link asChild push href={{ pathname: '/delivery-proposal', params: { id: transaction.id } }}>
        <Button className="flex-1" disablePressAnimation>
          <ButtonText numberOfLines={1}>Propose</ButtonText>
        </Button>
      </Link>

      <ActionModal
        variant="outline"
        action="negative"
        title="Confirm Disagreement"
        description="Are you sure you want to disagree to this delivery option?"
        triggerIcon={XIcon}
        isDisabled={!!disableRejectButton}
        iconOnly
        confirmLabel="Disagree"
        onConfirm={handleReject}
      />
    </HStack>
  );
}

function MessageButton({
  recipient,
  size = 'sm',
  action = 'default',
  variant = 'outline',
  ...props
}: { recipient: User['profile'] } & ButtonProps) {
  const { data: meUser } = useMeUser();
  const sender = meUser?.profile;
  return (
    <Button {...props} size={size} action={action} variant={variant}>
      <ButtonIcon as={MessageCircleIcon} />
      <ButtonText>Message</ButtonText>
    </Button>
  );
}

//#region Helpers
function extractData(data: Transaction | undefined) {
  if (!data) return {};

  return {
    confirmDeliveryAddress: extractCollection(data.delivery?.confirmed?.address),
    latestProposal: getLatestDeliveryProposal(data.delivery?.proposed),
  };
}
//#endregion
