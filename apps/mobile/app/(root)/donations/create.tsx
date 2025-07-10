import { DonationDetailsForm } from '@/components/forms/donation-request/DonationDetailsForm';
import FormPreventBack from '@/components/forms/FormPreventBack';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateDonationForm } from '@/hooks/forms';

import { uploadImage } from '@/lib/api/file';
import { upsertDeliveryPreferences } from '@/lib/api/upsert';

import { DonationCreateSearchParams } from '@/lib/types/donationRequest';

import { getApiClient } from '@lactalink/api';
import { DonationSchema, ErrorSearchParams, Individual, MilkBag } from '@lactalink/types';
import { extractErrorMessage, extractID } from '@lactalink/utilities';

import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

export default function CreateDonationRequest() {
  //#region Hooks
  const router = useRouter();
  const { matchedRequest: matchedRequestID } = useLocalSearchParams<DonationCreateSearchParams>();

  const {
    user,
    isFetching: isAuthFetching,
    isLoading: isAuthLoading,
    profile,
    error: authError,
  } = useAuth();

  const {
    form,
    isLoading: isFormLoading,
    isFetching: isFormFetching,
    error: formError,
  } = useCreateDonationForm({
    user,
    profile,
    matchedRequest: matchedRequestID,
  });
  //#endregion

  //#region Form State
  const isLoading = isAuthLoading || isFormLoading;
  const isFetching = isAuthFetching || isFormFetching;
  const error = authError || formError;

  const isSubmitting = form.formState.isSubmitting;
  // #endregion

  async function onSubmit(data: DonationSchema) {
    const createPromise = createDonation(data);

    toast.promise(createPromise, {
      loading: `Submitting donation...`,
      success: (res: { message: string }) => {
        console.log(res.message, res);
        return res.message;
      },
      error: (error) => extractErrorMessage(error),
    });

    await createPromise;

    router.replace('/map');
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
            <DonationDetailsForm isLoading={isLoading} matchedRequest={matchedRequestID} />

            {!isLoading && (
              <Box className="mx-5">
                <ActionModal
                  triggerLabel="Submit"
                  action="primary"
                  onConfirm={form.handleSubmit(onSubmit)}
                  isDisabled={isSubmitting}
                  title="Review Donation"
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

async function createDonation(data: DonationSchema) {
  const apiClient = getApiClient();
  const { details, donor, deliveryPreferences: deliveryDetails, matchedRequest } = data;

  const { bags, milkSample, ...restOfDetails } = details;

  console.log('Creating donation with data:', data);

  const milkBagDocs = (
    await Promise.all(
      bags.map(async ({ quantity, ...data }) => {
        const docs: MilkBag[] = [];
        for (let i = 0; i < quantity; i++) {
          const milkBagDoc = await apiClient.create({
            depth: 0,
            collection: 'milkBags',
            data: { ...data, status: 'AVAILABLE' },
          });
          docs.push(milkBagDoc);
        }
        return docs;
      })
    )
  ).flat();

  const milkSampleDocs =
    milkSample && (await Promise.all(milkSample.map((sample) => uploadImage('images', sample))));

  const deliveryDetailDocs = await upsertDeliveryPreferences(deliveryDetails);

  const donationDoc = await apiClient.create({
    collection: 'donations',
    data: {
      donor,
      status: 'AVAILABLE',
      details: {
        ...restOfDetails,
        bags: extractID(milkBagDocs),
        milkSample: milkSampleDocs && extractID(milkSampleDocs),
      },
      deliveryDetails: extractID(deliveryDetailDocs),
    },
  });

  if (matchedRequest) {
    const { requester } = await apiClient.updateByID({
      collection: 'requests',
      id: matchedRequest.id,
      data: { matchedDonation: donationDoc.id, details: { bags: extractID(milkBagDocs) } },
    });

    const requesterName = (requester as Individual).displayName;
    return { message: `Donation created for ${requesterName}!` };
  }

  return {
    message: 'Donation created successfully!',
  };
}
