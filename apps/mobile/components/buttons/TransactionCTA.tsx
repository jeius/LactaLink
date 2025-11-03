import { useMeUser } from '@/hooks/auth/useAuth';
import { usePreparingMutation } from '@/hooks/mutations/useTransactionMutation';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractName } from '@lactalink/utilities/extractors';
import { Button, ButtonText } from '../ui/button';
import { VStack } from '../ui/vstack';

export function TransactionCTA({
  queryKey,
  transaction,
}: {
  queryKey: unknown[];
  transaction?: Transaction;
}) {
  const { data: meUser } = useMeUser();
  const isMeSender = isEqualProfiles(transaction?.sender, meUser?.profile);
  const isMeRecipient = isEqualProfiles(transaction?.recipient, meUser?.profile);

  const senderName = extractName({ profile: transaction?.sender });
  const recipientName = extractName({ profile: transaction?.recipient });

  const { mutateAsync: prepare } = usePreparingMutation(queryKey);

  const status = transaction?.status;

  function handlePrepare() {
    if (!transaction) return;
    prepare(transaction);
  }

  if (isMeSender) {
    return (
      <VStack space="xs" className="items-stretch px-5">
        <Button action="positive" onPress={handlePrepare}>
          <ButtonText>Start Preparing</ButtonText>
        </Button>
      </VStack>
    );
  }

  return null;
}
