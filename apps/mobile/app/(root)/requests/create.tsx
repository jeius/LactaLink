import { RequestDetailsForm } from '@/components/forms/donation-request/RequestDetailsForm';
import FormPreventBack from '@/components/forms/FormPreventBack';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateRequestForm } from '@/hooks/forms';

import { uploadImage } from '@/lib/api/file';
import { COLLECTION_QUERY_KEY } from '@/lib/constants';

import { RequestSearchParams } from '@/lib/types/donationRequest';

import { getApiClient } from '@lactalink/api';
import { ErrorSearchParams, RequestSchema } from '@lactalink/types';
import { extractErrorMessage, extractID } from '@lactalink/utilities';
import { useQueryClient } from '@tanstack/react-query';

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

export default function CreateDonationRequest() {
  //#region Hooks
  const { matchedDonation, requestedDonorId } = useLocalSearchParams<RequestSearchParams>();
  const queryClient = useQueryClient();
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
    matchedDonation,
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

    queryClient.invalidateQueries({
      queryKey: COLLECTION_QUERY_KEY,
    });

    router.replace('/map');
  }
  //#endregion

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
            <RequestDetailsForm isLoading={isLoading} matchedDonation={matchedDonation} />

            {!isLoading && (
              <Box className="mx-5">
                <ActionModal
                  triggerLabel="Submit"
                  action="primary"
                  onConfirm={form.handleSubmit(onSubmit)}
                  isDisabled={isSubmitting}
                  title="Review Request"
                />
              </Box>
            )}
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
    requestedDonor,
    matchedDonation,
  } = data;

  const { image, ...restOfDetails } = details;

  const imageDoc = image && (await uploadImage('images', image));

  const requestDoc = await apiClient.create({
    collection: 'requests',
    data: {
      requester,
      status: 'PENDING',
      details: {
        ...restOfDetails,
        image: imageDoc && extractID(imageDoc),
      },
      deliveryDetails: deliveryDetails.map((pref) => pref?.id).filter(Boolean) as string[],
      volumeNeeded,
      matchedDonation: matchedDonation ? matchedDonation.id : undefined,
      requestedDonor: requestedDonor,
    },
  });

  return {
    message: 'Request created successfully!',
  };
}
