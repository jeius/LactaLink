import { RequestReviewCard } from '@/components/cards/RequestReviewCard';
import { Form } from '@/components/contexts/FormProvider';
import { RequestDetailsForm } from '@/components/forms/donation-request/RequestDetailsForm';
import FormPreventBack from '@/components/forms/FormPreventBack';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { ActionModal } from '@/components/modals';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { useCreateRequestForm } from '@/hooks/forms';
import { deleteCollection } from '@/lib/api/delete';

import { uploadImage } from '@/lib/api/file';

import { RequestSearchParams } from '@/lib/types/donationRequest';

import { getApiClient, getTransactionService } from '@lactalink/api';
import { CollectionSlug, ErrorSearchParams, RequestSchema, Transaction } from '@lactalink/types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities';

import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

export default function CreateRequest() {
  //#region Hooks
  const { matchedDonation, recipientID, recipientSlug } =
    useLocalSearchParams<RequestSearchParams>();
  const revalidateQueries = useRevalidateCollectionQueries();

  const meUser = useMeUser();

  const router = useRouter();

  const { form, ...restOfForm } = useCreateRequestForm({
    user: meUser?.data || null,
    matchedDonation,
    recipient:
      recipientID && recipientSlug
        ? {
            value: recipientID,
            relationTo: recipientSlug,
          }
        : undefined,
  });
  //#endregion

  //#region Form State
  const isLoading = meUser.isLoading || restOfForm.isLoading;
  const isFetching = meUser.isFetching || restOfForm.isFetching;
  const error = meUser.error || restOfForm.error;
  const isRefetching = meUser.isRefetching || restOfForm.isRefetching;
  const onRefresh = () => {
    meUser.refetch();
    restOfForm.refetch();
  };

  const isSubmitting = form.formState.isSubmitting;
  // #endregion

  //#region Form Handlers
  async function onSubmit(data: RequestSchema) {
    const createPromise = createRequest(data);

    toast.promise(createPromise, {
      loading: `Submitting Request...`,
      success: (res: { message: string }) => {
        console.log(res.message, res);
        return res.message;
      },
      error: (error) => extractErrorMessage(error),
    });

    const { transaction } = await createPromise;

    const slugsToRevalidate: CollectionSlug[] = ['requests', 'notifications'];

    if (transaction) {
      router.dismissTo(`/transactions/${transaction.id}`);
      slugsToRevalidate.push('donations', 'transactions');
    } else {
      router.dismissTo('/account/requests');
    }

    revalidateQueries(slugsToRevalidate);
  }

  async function handleValidation() {
    const isValid = await form.trigger();
    if (!isValid) {
      throw new Error('Form validation failed');
    }
  }
  //#endregion

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <Form
      {...form}
      isLoading={isLoading}
      isFetching={isFetching}
      refreshing={isRefetching}
      onRefresh={onRefresh}
      fetchError={error}
    >
      <Stack.Screen options={{ headerShown: true, title: 'Create Request' }} />
      <FormPreventBack />

      <SafeArea safeTop={false}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        >
          <VStack space="lg">
            <RequestDetailsForm />

            {!isLoading && (
              <Box className="mx-5">
                <ActionModal
                  triggerLabel="Submit"
                  action="primary"
                  onTriggerPress={handleValidation}
                  onConfirm={form.handleSubmit(onSubmit)}
                  isDisabled={isSubmitting}
                  title="Review Request"
                  description={
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      className="border-outline-200"
                      style={{ maxHeight: 380, borderTopWidth: 1, borderBottomWidth: 1 }}
                    >
                      <RequestReviewCard data={form.getValues()} variant="ghost" className="p-2" />
                    </ScrollView>
                  }
                />
              </Box>
            )}
          </VStack>
        </ScrollView>

        <FetchingSpinner isFetching={isLoading} />
      </SafeArea>
    </Form>
  );
}

async function createRequest(data: RequestSchema) {
  const apiClient = getApiClient();

  const { deliveryPreferences, details, requester, volumeNeeded, recipient, matchedDonation } =
    data;

  const { image, ...restOfDetails } = details;

  const imageDoc = image && (await uploadImage('images', image));

  const requestDoc = await apiClient
    .create({
      collection: 'requests',
      data: {
        requester,
        status: 'AVAILABLE',
        details: {
          ...restOfDetails,
          image: imageDoc && extractID(imageDoc),
        },
        deliveryPreferences: extractID(deliveryPreferences),
        initialVolumeNeeded: volumeNeeded,
        volumeNeeded,
        volumeFulfilled: 0,
      },
    })
    .catch(async (err) => {
      await Promise.all([deleteCollection('images', imageDoc?.id)]);
      throw err;
    });

  let transaction: Transaction | undefined;
  let message = 'Request created successfully!';

  if (matchedDonation) {
    const transactionService = getTransactionService();
    transaction = await transactionService.createP2PTransaction({
      donation: matchedDonation.id,
      request: requestDoc,
      milkBags: restOfDetails.bags || [],
    });

    const donation = extractCollection(transaction.donation);

    const donorName = extractCollection(donation?.donor)?.givenName || 'Donor';
    message = `Thank you! ${donorName} has been notified of your request.`;
  }

  return { transaction, message };
}
