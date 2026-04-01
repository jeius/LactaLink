import { RequestReviewCard } from '@/components/cards/RequestReviewCard';
import { Form } from '@/components/contexts/FormProvider';
import FormPreventBack from '@/components/forms/FormPreventBack';
import FormSaver from '@/components/forms/FormSaver';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import ScrollView from '@/components/ui/ScrollView';
import { RequestDetailsForm } from '@/features/donation&request/components/forms/RequestDetailsForm';
import { useCreateRequestForm } from '@/features/donation&request/hooks/useCreateRequestForm';
import { useRevalidateCollectionQueries } from '@/hooks/collections/useRevalidateQueries';
import { createRequest } from '@/lib/api/request';
import { RequestCreateParams } from '@/lib/types/donationRequest';
import { RequestCreateSchema } from '@lactalink/form-schemas';
import { ErrorSearchParams } from '@lactalink/types';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { toast } from 'sonner-native';

export default function RequestCreateScreen() {
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
    <>
      <Stack.Screen options={{ headerTitle: 'New Request', headerShown: true }} />

      <Form {...form}>
        <FormSaver schemaName="request-create" enabled={!matchedDonation && !recipientID} />

        <FormPreventBack />

        <SafeArea safeTop={false} className="items-stretch">
          <KeyboardAvoidingScrollView
            refreshing={refreshing}
            onRefresh={onRefresh}
            className="flex-1"
            contentContainerClassName="grow gap-4 py-5"
          >
            <RequestDetailsForm matchedDonation={matchedDonation} />

            {!isLoading && (
              <Box className="mx-5">
                <ActionModal
                  action="primary"
                  onTriggerPress={handleValidation}
                  onConfirm={handleSubmit(onSubmit)}
                  isDisabled={isSubmitting}
                  modalSize="lg"
                  title="Review Request"
                  triggerButtonProps={{ label: 'Submit Request' }}
                  confirmButtonProps={{ label: 'Submit' }}
                  description={
                    <ScrollView
                      className="border-outline-200"
                      style={{ maxHeight: 380, borderTopWidth: 1, borderBottomWidth: 1 }}
                    >
                      <RequestReviewCard data={getValues()} variant="ghost" className="p-2" />
                    </ScrollView>
                  }
                />
              </Box>
            )}
          </KeyboardAvoidingScrollView>

          <FetchingSpinner isFetching={isLoading} />
        </SafeArea>
      </Form>
    </>
  );
}
