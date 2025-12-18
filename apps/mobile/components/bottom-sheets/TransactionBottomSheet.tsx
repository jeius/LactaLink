import React, { useMemo } from 'react';

import { DonationListCard, RequestListCard } from '@/components/cards';
import { MilkBagList } from '@/components/lists/horizontal-flatlists';
import {
  BottomSheet,
  BottomSheetPortal,
  BottomSheetScrollView,
} from '@/components/ui/bottom-sheet';
import { BottomSheetHandle } from '@/components/ui/BottomSheetHandle';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useDeliveryMutations } from '@/hooks/mutations/useDeliveryMutations';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DELIVERY_OPTIONS, TRANSACTION_STATUS, TRANSACTION_TYPE } from '@lactalink/enums';
import { DeliveryDetail, Transaction } from '@lactalink/types/payload-generated-types';
import { MarkKeyRequired } from '@lactalink/types/utils';
import { displayVolume } from '@lactalink/utilities';
import { extractCollection } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import isEqual from 'lodash/isEqual';
import { CheckIcon, XIcon } from 'lucide-react-native';
import { TransactionMessageCard } from '../../features/transactions/components/TransactionMessageCard';
import { ProfileAvatar } from '../Avatar';
import { TransactionCTA } from '../buttons/TransactionCTA';
import { DeliveryCard } from '../cards/DeliveryCard';
import { ActionModal } from '../modals/ActionModal';
import { BottomSheetPortalProps, BottomSheetProps } from '../ui/bottom-sheet/types';
import { Box } from '../ui/box';
import { Button, ButtonText } from '../ui/button';
import { Divider } from '../ui/divider';

const PENDING = TRANSACTION_STATUS.PENDING.value;
const SCHEDULED = TRANSACTION_STATUS.CONFIRMED.value;

interface TransactionBottomSheetProps
  extends Pick<BottomSheetPortalProps, 'animatedPosition' | 'snapPoints'>,
    Pick<BottomSheetProps, 'snapToIndex'> {
  transaction: Transaction;
}
export function TransactionBottomSheet({
  transaction: data,
  ...props
}: TransactionBottomSheetProps) {
  const { donation, request, milkBags } = useMemo(() => extractData(data), [data]);

  const sender = data?.sender;
  const recipient = data?.recipient;
  const status = TRANSACTION_STATUS[data?.status || PENDING];

  function renderContent() {
    switch (status.value) {
      case PENDING: {
        if (!latestProposal) {
          return <Propose transactionID={transactionID} />;
        }
        return (
          <ProposalInformation
            proposal={latestProposal}
            transaction={data}
            queryKey={queryKey}
            isLoading={isLoading}
          />
        );
      }
      case SCHEDULED: {
        return (
          <>
            <DeliveryInformation delivery={confirmedDelivery} />
            <TransactionCTA queryKey={queryKey} transaction={data} />
          </>
        );
      }
      default:
        return <Propose transactionID={transactionID} />;
    }
  }

  return (
    <BottomSheet snapToIndex={props.snapToIndex} disableClose>
      <BottomSheetPortal
        {...props}
        handleComponent={BottomSheetHandle}
        enableContentPanningGesture={true}
        enableDynamicSizing={false}
        animateOnMount={true}
        backgroundStyle={{ backgroundColor: 'transparent' }}
        enableOverDrag={false}
      >
        <BottomSheetScrollView
          contentContainerClassName="flex-col gap-4 bg-background-0 pb-5 grow"
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}

          <TransactionMessageCard transaction={data} className="mx-5 my-2" />

          <Divider />

          <Text bold size="lg" className="mx-5">
            Transaction Details
          </Text>

          {donation !== null && (
            <VStack space="xs" className="px-5">
              <Text className="mb-1 font-JakartaSemiBold">Donation</Text>
              <DonationListCard className="border-primary-500" hideFooter data={donation} />
            </VStack>
          )}

          {request !== null && (
            <VStack space="xs" className="px-5">
              <Text className="mb-1 font-JakartaSemiBold">Request</Text>
              <RequestListCard className="border-tertiary-500" hideFooter data={request} />
            </VStack>
          )}

          {milkBags && <MilkBagList data={milkBags} label="Milk Bags" />}
        </BottomSheetScrollView>
      </BottomSheetPortal>
    </BottomSheet>
  );
}

function extractData(data: Transaction | undefined) {
  if (!data) return {};
  return {
    transactionNo: data.txn,
    volumeLabel: displayVolume(data.volume),
    donation: extractCollection(data.donation),
    request: extractCollection(data.request),
    milkBags: extractCollection(data.milkBags),
    type: TRANSACTION_TYPE[data.type].label,
  };
}

function DeliveryInformation({ delivery }: { delivery: DeliveryDetail }) {
  const deliveryMode = DELIVERY_OPTIONS[delivery.method].label;
  return (
    <VStack space="xs" className="items-stretch px-5">
      <Text bold size="lg">
        {deliveryMode} Details
      </Text>
      <DeliveryCard data={delivery} className="gap-1" size="lg" />
    </VStack>
  );
}

interface ProposalInformationProps {
  proposal: DeliveryDetail;
  transaction?: Transaction;
  queryKey: unknown[];
  isLoading?: boolean;
}

function ProposalInformation({ proposal, transaction, queryKey }: ProposalInformationProps) {
  const agreementsAvatarStyle = useMemo(
    () =>
      tva({
        base: 'aspect-square w-10 rounded-full border-2 border-background-300 bg-background-300',
        variants: {
          agreed: {
            true: 'border-success-400',
            false: 'border-error-400',
            undefined: 'border-background-300',
          },
        },
      }),
    []
  );

  const {
    address,
    datetime,
    mode,
    instructions,
    agreements: { sender, recipient } = {},
  } = proposal;

  const parties = [sender, recipient].filter((v) => v !== undefined);
  const deliveryMode = DELIVERY_OPTIONS[mode].label;

  return (
    <VStack space="xs" className="items-stretch px-5">
      <Text bold size="lg">
        {deliveryMode} Proposal
      </Text>

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
      </HStack>

      {transaction && (
        <ProposalCTA proposal={proposal} transaction={transaction} queryKey={queryKey} />
      )}
    </VStack>
  );
}

function ProposalCTA({
  proposal,
  transaction,
  queryKey,
}: MarkKeyRequired<ProposalInformationProps, 'transaction'>) {
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
    <VStack space="md" className="mt-4 items-stretch">
      <Link asChild push href={{ pathname: '/delivery-proposal', params: { id: transaction.id } }}>
        <Button disablePressAnimation variant="outline">
          <ButtonText numberOfLines={1}>Make a proposal</ButtonText>
        </Button>
      </Link>
      <HStack space="md" className="items-stretch">
        <ActionModal
          variant="solid"
          action="positive"
          title="Confirm Agreement"
          description="Are you sure you want to agree to this delivery option?"
          className="flex-1"
          triggerIcon={CheckIcon}
          isDisabled={!!disableAgreeButton}
          triggerLabel="Agree"
          confirmLabel="Agree"
          onConfirm={handleAgree}
        />

        <ActionModal
          variant="solid"
          action="negative"
          title="Confirm Disagreement"
          description="Are you sure you want to disagree to this delivery option?"
          className="flex-1"
          triggerIcon={XIcon}
          isDisabled={!!disableRejectButton}
          triggerLabel="Disagree"
          confirmLabel="Disagree"
          onConfirm={handleReject}
        />
      </HStack>
    </VStack>
  );
}

function Propose(props: { transactionID: string }) {
  const { transactionID } = props;

  return (
    <VStack space="sm" className="items-stretch px-5">
      <Text>No delivery location and method proposed yet.</Text>
      <HStack space="sm">
        <Link asChild push href={{ pathname: '/delivery-proposal', params: { id: transactionID } }}>
          <Button size="sm" className="flex-1">
            <ButtonText numberOfLines={1}>Propose</ButtonText>
          </Button>
        </Link>
      </HStack>
    </VStack>
  );
}
