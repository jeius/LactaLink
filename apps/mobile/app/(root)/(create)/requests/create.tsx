import { RequestReviewCard } from '@/components/cards/RequestReviewCard';
import { Form } from '@/components/contexts/FormProvider';
import FormPreventBack from '@/components/forms/FormPreventBack';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { ActionModal } from '@/components/modals';
import { RefreshControl } from '@/components/RefreshControl';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { RequestDetailsForm } from '@/features/donation&request/components/forms/RequestDetailsForm';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';

import { RequestCreateParams } from '@/lib/types/donationRequest';
import { RequestCreateSchema } from '@lactalink/form-schemas';

import { ErrorSearchParams } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';

import FormSaver from '@/components/forms/FormSaver';
import { useCreateRequestForm } from '@/features/donation&request/hooks/useCreateRequestForm';
import { createRequest } from '@/lib/api/request';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { toast } from 'sonner-native';

export default function CreateRequest() {
  //#region Hooks
  const {
    mdid: matchedDonation,
    rid: recipientID,
    rslg: recipientSlug,
  } = useLocalSearchParams<RequestCreateParams>();

  const revalidateQueries = useRevalidateCollectionQueries();
  const router = useRouter();

  const form = useCreateRequestForm({
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
  const { isLoading, refreshing = false, onRefresh, fetchError, handleSubmit, getValues } = form;

  const isSubmitting = form.formState.isSubmitting;
  // #endregion

  //#region Form Handlers
  async function onSubmit(data: RequestCreateSchema) {
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

    const slugsToRevalidate: CollectionSlug[] = ['requests', 'notifications', 'milkBags'];

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

  if (!isLoading && fetchError) {
    const params: ErrorSearchParams = { message: fetchError.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <Form {...form}>
      <FormSaver schemaName="request-create" enabled={!matchedDonation && !recipientID} />
      <FormPreventBack />

      <SafeArea safeTop={false}>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <VStack space="lg">
            <RequestDetailsForm matchedDonation={matchedDonation} />

            {!isLoading && (
              <Box className="mx-5">
                <ActionModal
                  triggerLabel="Submit"
                  action="primary"
                  onTriggerPress={handleValidation}
                  onConfirm={handleSubmit(onSubmit)}
                  isDisabled={isSubmitting}
                  modalSize="lg"
                  title="Review Request"
                  description={
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      className="border-outline-200"
                      style={{ maxHeight: 380, borderTopWidth: 1, borderBottomWidth: 1 }}
                    >
                      <RequestReviewCard data={getValues()} variant="ghost" className="p-2" />
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
