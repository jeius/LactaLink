import { DeliveryForm } from '@/components/forms/donation-request/DeliveryForm';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import {
  TransactionProvider,
  useBroadcastTransaction,
} from '@/features/transactions/components/context';
import { useTransaction } from '@/features/transactions/hooks/queries';
import { addTransactionToAllCache } from '@/features/transactions/lib/cacheUtils';
import { ProposeSearchParams } from '@/features/transactions/lib/types';
import { getMeUser } from '@/lib/stores/meUserStore';
import { mergeDateTime } from '@/lib/utils/mergeDateTime';
import { transformToDeliverySchema } from '@/lib/utils/transformData';
import { getTransactionService } from '@lactalink/api';
import { DeliverySchema } from '@lactalink/form-schemas';
import { ErrorSearchParams } from '@lactalink/types';
import { DeliveryPreference, Transaction } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { useQueryClient } from '@tanstack/react-query';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import KeyboardAvoidingScrollView from '../KeyboardAvoider';
import FormSheetHandle from '../ui/FormSheetHandle';

export default function DeliveryProposalScreen() {
  const inset = useSafeAreaInsets();
  const { txnID, edit } = useLocalSearchParams<ProposeSearchParams>();
  const { data: transaction, isLoading, isRefetching, refetch, error } = useTransaction(txnID);

  useEffect(() => {
    if (error) toast.error(extractErrorMessage(error));
  }, [error]);

  if (!txnID) {
    const params: ErrorSearchParams = {
      title: 'Transaction Not Found',
      message: 'The transaction ID is missing or invalid.',
    };
    return <Redirect withAnchor href={{ pathname: '/error', params }} />;
  }

  return (
    <Box className="flex-1" style={{ paddingBottom: inset.bottom }}>
      {isLoading || !transaction ? (
        <Spinner size={'large'} />
      ) : (
        <TransactionProvider transaction={transaction}>
          <FormSheetHandle />
          <MainComponent
            transaction={transaction}
            isRefetching={isRefetching}
            onRefetch={refetch}
            canEdit={edit === 'true' ? true : edit === 'false' ? false : edit}
          />
        </TransactionProvider>
      )}
    </Box>
  );
}

interface Props {
  transaction: Transaction;
  isRefetching: boolean;
  onRefetch: () => void;
  canEdit?: boolean;
}

function MainComponent({ transaction, isRefetching, onRefetch: refetch, canEdit }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const broadcastTxn = useBroadcastTransaction();

  const deliveryPreferences = useMemo(() => getDeliveryPreferences(transaction), [transaction]);
  const deliveryPlan = extractCollection(transaction.deliveryPlans?.docs?.[0]);
  const deliverySchema = deliveryPlan ? transformToDeliverySchema(deliveryPlan) : undefined;

  async function handleSubmit(data: DeliverySchema) {
    if (!transaction) return;

    const promise = propose(transaction, data);

    toast.promise(promise, {
      loading: `Proposing ${data.mode.toLowerCase()}...`,
      success: () => 'Proposed Successfully',
      error: (err) => extractErrorMessage(err),
    });

    try {
      const newTxn = await promise;
      if (newTxn) {
        addTransactionToAllCache(queryClient, newTxn);
        broadcastTxn(newTxn);
        router.back();
      }
    } catch (error) {
      console.warn('Error proposing delivery option:', error);
    }
  }

  return (
    <KeyboardAvoidingScrollView
      className="flex-1 flex-col"
      showsVerticalScrollIndicator={false}
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      <HStack space="lg" className="items-center px-2 pb-5">
        <HeaderBackButton />
        <Text bold size="lg">
          Propose Delivery
        </Text>
      </HStack>
      <DeliveryForm
        deliveryPreferences={deliveryPreferences}
        values={canEdit ? deliverySchema : undefined}
        onChange={handleSubmit}
        className="px-5"
      />
    </KeyboardAvoidingScrollView>
  );
}

// Helpers
async function propose(transaction: Transaction, data: DeliverySchema) {
  const meUser = getMeUser();

  if (!meUser?.profile) return;

  const date = mergeDateTime(data.date, data.time);

  const service = getTransactionService();
  return service.proposeDeliveryOption(transaction, {
    address: extractID(data.address),
    method: data.mode,
    scheduledAt: date.toISOString(),
    notes: data.note,
  });
}

function getDeliveryPreferences(transaction: Transaction) {
  const requestDP = extractCollection(transaction?.request)?.deliveryPreferences;
  const donationDP = extractCollection(transaction?.donation)?.deliveryPreferences;

  // Remove duplicates by using a Map with ID as key
  const dpMap = new Map<string, DeliveryPreference>();
  [...(extractCollection(requestDP) || []), ...(extractCollection(donationDP) || [])].forEach(
    (dp) => dpMap.set(dp.id, dp)
  );

  return Array.from(dpMap.values());
}
