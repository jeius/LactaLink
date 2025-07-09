import { RequestDetailsForm } from '@/components/forms/donation-request/RequestDetailsForm';
import FormPreventBack from '@/components/forms/FormPreventBack';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateRequestForm } from '@/hooks/forms';

import { uploadImage } from '@/lib/api/file';
import { upsertDeliveryPreferences } from '@/lib/api/upsert';

import { RequestSearchParams } from '@/lib/types/donationRequest';

import { getApiClient } from '@lactalink/api';
import { ErrorSearchParams, RequestSchema } from '@lactalink/types';
import { extractErrorMessage, extractID } from '@lactalink/utilities';

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

export default function CreateDonationRequest() {
  //#region Hooks
  const { matchedDonation, requestedDonorId } = useLocalSearchParams<RequestSearchParams>();
  const {
    user,
    profile,
    isLoading: isAuthLoading,
    isFetching: isAuthFetching,
    error: authError,
  } = useAuth();

  const router = useRouter();

  const {
    form,
    isLoading: isFormLoading,
    isFetching: isFormFetching,
    error: formError,
  } = useCreateRequestForm({
    user,
    profile,
    requestedDonorId,
  });
  //#endregion

  //#region Form State
  const isLoading = isAuthLoading || isFormLoading;
  const isFetching = isAuthFetching || isFormFetching;
  const error = authError || formError;

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

    await createPromise;

    router.replace('/map');
  }
  //#endregion

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <FormProvider {...form}>
      <FormPreventBack />

      <SafeArea safeTop={false}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack space="lg">
            <RequestDetailsForm />

            <Button
              isDisabled={isSubmitting}
              size="lg"
              className="m-5"
              onPress={form.handleSubmit(onSubmit)}
            >
              <ButtonText>Submit</ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </SafeArea>

      {!isLoading && <FetchingSpinner isFetching={isFetching} />}
    </FormProvider>
  );
}

async function createRequest(data: RequestSchema) {
  const apiClient = getApiClient();

  const {
    deliveryPreferences: deliveryDetails,
    details,
    requester,
    volumeNeeded,
    requestedDonor: _,
  } = data;

  const { image, ...restOfDetails } = details;

  const imageDoc = image && (await uploadImage('images', image));

  const deliveryDetailDocs = await upsertDeliveryPreferences(deliveryDetails);

  const requestDoc = await apiClient.create({
    collection: 'requests',
    data: {
      requester,
      status: 'PENDING',
      details: {
        ...restOfDetails,
        image: imageDoc && extractID(imageDoc),
      },
      deliveryDetails: extractID(deliveryDetailDocs),
      volumeNeeded,
    },
  });

  // Todo: Handle case where requestedDonor is provided
  // If provided, get the existing donationDoc of the requestedDonor and update it with the new request

  return {
    message: 'Request created successfully!',
  };
}
