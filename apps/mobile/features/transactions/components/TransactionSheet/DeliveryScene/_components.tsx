import React from 'react';

import { ProfileAvatar } from '@/components/Avatar';
import { DeliveryCard } from '@/components/cards/DeliveryCard';
import { ActionModal } from '@/components/modals/ActionModal';
import { Box } from '@/components/ui/box';
import { Button, ButtonProps, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useAgreeMutation, useDisagreeMutation } from '@/features/transactions/hooks/mutations';
import { ProposeSearchParams } from '@/features/transactions/lib/types';
import { getColor } from '@/lib/colors';
import { isMeProfile } from '@/lib/utils/isMeUser';
import { DELIVERY_DETAILS_STATUS } from '@lactalink/enums';
import { DeliveryDetail } from '@lactalink/types/payload-generated-types';
import { isPlaceHolderData } from '@lactalink/utilities/checkers';
import { extractID } from '@lactalink/utilities/extractors';
import { Link, useRouter } from 'expo-router';
import { CheckIcon, Settings2Icon, XIcon } from 'lucide-react-native';
import { useBroadcastTransaction, useTransactionContext } from '../../context';

function DeliveryPlan({ item }: { item: DeliveryDetail; onPress?: () => void }) {
  if (isPlaceHolderData(item)) return <Skeleton variant="rounded" className="h-64 w-full" />;
  return (
    <Pressable className="overflow-hidden rounded-2xl">
      <Card className="gap-5 p-5">
        <DeliveryCard data={item} variant="ghost" className="p-0" />
        <DeliveryPlanActions item={item} />
      </Card>
    </Pressable>
  );
}

function DeliveryPlanActions({ item }: { item: DeliveryDetail }) {
  const router = useRouter();
  const { status, proposedBy } = item;

  const transaction = useTransactionContext();
  const { mutateAsync: agree, isPending: isAgreeing } = useAgreeMutation(transaction);
  const { mutateAsync: disagree, isPending: isDisagreeing } = useDisagreeMutation(transaction);

  const broadcastTxn = useBroadcastTransaction();

  const isPending = DELIVERY_DETAILS_STATUS.PENDING.value === status;
  const isAccepted = DELIVERY_DETAILS_STATUS.ACCEPTED.value === status;
  const isRejected = DELIVERY_DETAILS_STATUS.REJECTED.value === status;
  const isDisabled = isAgreeing || isDisagreeing;

  const isMeProposer = isMeProfile(proposedBy);

  function handleAgree() {
    agree(item)
      .catch((err) => {
        console.error('Error agreeing to delivery proposal:', err);
        throw err;
      })
      .then((newTxn) => {
        broadcastTxn(newTxn);
      });
  }

  function handleReject() {
    disagree(item)
      .catch((err) => {
        console.error('Error rejecting delivery proposal:', err);
        throw err;
      })
      .then((newTxn) => {
        broadcastTxn(newTxn);
      });
  }

  function handleEditPress() {
    const params: ProposeSearchParams = { txnID: extractID(item.transaction), edit: 'true' };
    router.push({ pathname: '/transactions/propose', params });
  }

  return (
    <HStack space="md" className="items-center">
      <ProfileAvatar profile={proposedBy} size="sm" />
      <Box className="h-1 w-1 rounded-full bg-background-300" />

      {isMeProposer ? (
        isPending ? (
          <>
            <Box className="flex-1 items-center rounded-lg bg-secondary-50 px-5 py-2">
              <Text
                italic
                className="font-JakartaItalic text-secondary-900"
                style={{ opacity: 0.6 }}
              >
                You Proposed
              </Text>
            </Box>
            <Pressable className="overflow-hidden rounded-lg p-3" onPress={handleEditPress}>
              <Icon as={Settings2Icon} />
            </Pressable>
          </>
        ) : (
          <CTA isAccepted={isAccepted} label={(accepted) => (accepted ? 'Accepted' : 'Rejected')} />
        )
      ) : isPending ? (
        <>
          <ActionModal
            variant="solid"
            action="positive"
            title="Confirm Agreement"
            description="Are you sure you want to agree to this delivery option?"
            className="flex-1"
            enableSpinner={isAgreeing}
            triggerIcon={CheckIcon}
            triggerLabel="Agree"
            confirmLabel="Agree"
            onConfirm={handleAgree}
            isDisabled={isDisabled}
          />

          <ActionModal
            variant="solid"
            action="negative"
            title="Confirm Disagreement"
            description="Are you sure you want to disagree to this delivery option?"
            className="flex-1"
            enableSpinner={isDisagreeing}
            triggerIcon={XIcon}
            triggerLabel="Disagree"
            confirmLabel="Disagree"
            onConfirm={handleReject}
            isDisabled={isDisabled}
          />
        </>
      ) : (
        <CTA isAccepted={isAccepted} label={(accepted) => (accepted ? 'Agreed' : 'Disagreed')} />
      )}
    </HStack>
  );
}

function CTA({ isAccepted, label }: { isAccepted: boolean; label: (val: boolean) => string }) {
  return (
    <Box
      className="flex-1 items-center rounded-lg px-5 py-2"
      style={{ backgroundColor: isAccepted ? getColor('success', '50') : getColor('error', '50') }}
    >
      <Text
        italic
        style={{
          opacity: 0.6,
          color: isAccepted ? getColor('success', '900') : getColor('error', '900'),
        }}
      >
        {label(isAccepted)}
      </Text>
    </Box>
  );
}

function ProposeButton({
  label = 'Propose',
  size = 'sm',
}: {
  label?: string;
  size?: ButtonProps['size'];
}) {
  const transaction = useTransactionContext();
  const params: ProposeSearchParams = { txnID: transaction.id };
  return (
    <Link asChild push href={{ pathname: '/transactions/propose', params }}>
      <Button size={size}>
        <ButtonText numberOfLines={1}>{label}</ButtonText>
      </Button>
    </Link>
  );
}

export { DeliveryPlan, ProposeButton };
