import { DeliveryForm } from '@/components/forms/donation-request/DeliveryForm';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { useTransactionQuery } from '@/hooks/transactions/fetcher';
import { getMeUser } from '@/lib/stores/meUserStore';
import { mergeDateTime } from '@/lib/utils/mergeDateTime';
import { getTransactionService } from '@lactalink/api';
import { DeliverySchema } from '@lactalink/form-schemas';
import { ErrorSearchParams } from '@lactalink/types';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { useQueryClient } from '@tanstack/react-query';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function DeliveryProposalPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isRefetching, refetch, error, queryKey } = useTransactionQuery(id);

  const deliveryPreferences = useMemo(() => {
    const requestDP = extractCollection(data?.request)?.deliveryPreferences;
    const donationDP = extractCollection(data?.donation)?.deliveryPreferences;

    // Remove duplicates by using a Map with ID as key
    const dpMap = new Map<string, DeliveryPreference>();
    [...(extractCollection(requestDP) || []), ...(extractCollection(donationDP) || [])].forEach(
      (dp) => dpMap.set(dp.id, dp)
    );

    return Array.from(dpMap.values());
  }, [data?.request, data?.donation]);

  if (isLoading) {
    return (
      <SafeArea>
        <Spinner size={'large'} />
      </SafeArea>
    );
  }

  if (!id || !data) {
    const params: ErrorSearchParams = {
      title: 'Transaction Not Found',
      message: 'The transaction ID is missing or invalid.',
    };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  async function handleSubmit(data: DeliverySchema) {
    const promise = propose(id, data);

    toast.promise(promise, {
      loading: `Proposing ${data.mode.toLowerCase()}...`,
      success: () => 'Proposed Successfully',
      error: (err) => extractErrorMessage(err),
    });

    try {
      const transaction = await promise;
      if (transaction) {
        queryClient.setQueryData(queryKey, transaction);
        router.back();
      }
    } catch (error) {
      console.warn('Error proposing delivery option:', error);
    }
  }

  return (
    <Box
      className="bg-background-0 border-outline-200 overflow-hidden border"
      style={{
        flex: 1,
        marginTop: insets.top,
        paddingBottom: insets.bottom,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
    >
      <KeyboardAwareScrollView
        className="flex-1 flex-col"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5"
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <Text bold size="lg" className="mb-4">
          Propose Delivery
        </Text>
        <DeliveryForm
          isLoading={isLoading}
          deliveryPreferences={deliveryPreferences}
          onChange={handleSubmit}
        />
      </KeyboardAwareScrollView>
    </Box>
  );
}

async function propose(id: string | undefined, data: DeliverySchema) {
  const meUser = getMeUser();

  if (!id || !meUser?.profile) return;

  const date = mergeDateTime(data.date, data.time);

  const service = getTransactionService();
  return await service.proposeDeliveryOption(id, {
    address: extractID(data.address),
    mode: data.mode,
    datetime: date.toISOString(),
    instructions: data.note,
    proposedBy: { relationTo: 'individuals', value: extractID(meUser.profile.value) },
  });
}
