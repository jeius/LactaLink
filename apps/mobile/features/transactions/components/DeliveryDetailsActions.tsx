import { ProfileAvatar } from '@/components/Avatar';
import { ActionModal } from '@/components/modals/ActionModal';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { useAgreeMutation, useDisagreeMutation } from '@/features/transactions/hooks/mutations';
import { ProposeSearchParams } from '@/features/transactions/lib/types';
import { isMeProfile } from '@/lib/utils/isMeUser';
import { DELIVERY_DETAILS_STATUS } from '@lactalink/enums';
import { DeliveryDetail } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { CheckIcon, Settings2Icon, XIcon } from 'lucide-react-native';
import { useBroadcastTransaction, useTransactionContext } from './context';
import ProposeButton from './ProposeButton';

interface DeliveryDetailsActionsProps {
  deliveryPlan: DeliveryDetail;
}

export default function DeliveryDetailsActions({ deliveryPlan }: DeliveryDetailsActionsProps) {
  const router = useRouter();
  const { status, proposedBy } = deliveryPlan;

  const transaction = useTransactionContext();
  const { mutateAsync: agree, isPending: isAgreeing } = useAgreeMutation(transaction);
  const { mutateAsync: disagree, isPending: isDisagreeing } = useDisagreeMutation(transaction);

  const broadcastTxn = useBroadcastTransaction();

  const isPending = DELIVERY_DETAILS_STATUS.PENDING.value === status;
  const isDisabled = isAgreeing || isDisagreeing;

  const isMeProposer = isMeProfile(proposedBy);

  function handleAgree() {
    agree(deliveryPlan)
      .catch((err) => {
        console.error('Error agreeing to delivery proposal:', err);
        throw err;
      })
      .then((newTxn) => {
        broadcastTxn(newTxn);
      });
  }

  function handleReject() {
    disagree(deliveryPlan)
      .catch((err) => {
        console.error('Error rejecting delivery proposal:', err);
        throw err;
      })
      .then((newTxn) => {
        broadcastTxn(newTxn);
      });
  }

  function handleEditPress() {
    const params: ProposeSearchParams = {
      txnID: extractID(deliveryPlan.transaction),
      edit: 'true',
    };
    router.push({ pathname: '/transactions/propose', params });
  }

  return (
    <HStack space="md" className="items-center">
      <ProfileAvatar profile={proposedBy} size="sm" />
      <Box className="h-1 w-1 rounded-full bg-background-300" />

      {!isPending ? (
        <Box className="flex-1">
          <ProposeButton size="md" label="Propose another delivery" />
        </Box>
      ) : isMeProposer ? (
        <Button action="default" variant="outline" className="flex-1" onPress={handleEditPress}>
          <ButtonIcon as={Settings2Icon} />
          <ButtonText>Edit proposal</ButtonText>
        </Button>
      ) : (
        <>
          <ActionModal
            variant="solid"
            action="positive"
            title="Confirm Agreement"
            description="Are you sure you want to agree to this delivery option?"
            className="flex-1"
            onConfirm={handleAgree}
            isDisabled={isDisabled}
            triggerButtonProps={{ label: 'Agree', icon: CheckIcon, isLoading: isAgreeing }}
            confirmButtonProps={{ label: 'Agree' }}
          />

          <ActionModal
            variant="solid"
            action="negative"
            title="Confirm Disagreement"
            description="Are you sure you want to disagree to this delivery option?"
            className="flex-1"
            onConfirm={handleReject}
            isDisabled={isDisabled}
            triggerButtonProps={{ label: 'Disagree', icon: XIcon, isLoading: isDisagreeing }}
            confirmButtonProps={{ label: 'Disagree' }}
          />
        </>
      )}
    </HStack>
  );
}
