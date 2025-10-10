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
import { deleteCollection } from '@/lib/api/delete';

import { uploadImage } from '@/lib/api/file';

import { RequestSearchParams } from '@/lib/types/donationRequest';
import { RequestSchema } from '@lactalink/form-schemas';

import { getApiClient, getTransactionService } from '@lactalink/api';
import { ErrorSearchParams } from '@lactalink/types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities/extractors';

import { useCreateRequestForm } from '@/hooks/forms/useCreateRequestForm';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { toast } from 'sonner-native';

export default function CreateRequest() {
  //#region Hooks
  const { matchedDonation, recipientID, recipientSlug } =
    useLocalSearchParams<RequestSearchParams>();
  const revalidateQueries = useRevalidateCollectionQueries();

  const meUser = useMeUser();

  const router = useRouter();

  const { form } = useCreateRequestForm({
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
  const isLoading = meUser.isLoading;
  const isFetching = meUser.isFetching;
  const error = meUser.error;
  const isRefetching = meUser.isRefetching;
  const onRefresh = () => {
    meUser.refetch();
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
      <FormPreventBack />

      <SafeArea safeTop={false}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
        >
          <VStack space="lg">
            <RequestDetailsForm matchedDonation={matchedDonation} />

            {!isLoading && (
              <Box className="mx-5">
                <ActionModal
                  triggerLabel="Submit"
                  action="primary"
                  onTriggerPress={handleValidation}
                  onConfirm={form.handleSubmit(onSubmit)}
                  isDisabled={isSubmitting}
                  modalSize="lg"
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
        </KeyboardAwareScrollView>

        <FetchingSpinner isFetching={isLoading} />
      </SafeArea>
    </Form>
  );
}

async function createRequest(data: RequestSchema) {
  const apiClient = getApiClient();

  const { deliveryPreferences, details, requester, volumeNeeded, matchedDonation } = data;

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
          bags: extractID(restOfDetails.bags),
        },
        deliveryPreferences: extractID(deliveryPreferences),
        initialVolumeNeeded: volumeNeeded,
        volumeNeeded,
        volumeFulfilled: 0,
      },
    })
    .catch(async (err) => {
      await Promise.all([deleteCollection('images', imageDoc?.id, { silent: true })]);
      throw err;
    });

  let transaction: Transaction | undefined;
  let message = 'Request created successfully!';

  if (matchedDonation) {
    const transactionService = getTransactionService();
    transaction = await transactionService.createP2PTransaction({
      donation: matchedDonation.id,
      request: requestDoc,
      milkBags: extractID(restOfDetails.bags) || [],
    });

    const donation = extractCollection(transaction.donation);

    const donorName = extractCollection(donation?.donor)?.givenName || 'Donor';
    message = `Thank you! ${donorName} has been notified of your request.`;
  }

  return { transaction, message };
}
