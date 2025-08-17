import { DonationReviewCard } from '@/components/cards/DonationReviewCard';
import { DonationDetailsForm } from '@/components/forms/donation-request/DonationDetailsForm';
import FormPreventBack from '@/components/forms/FormPreventBack';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { ActionModal } from '@/components/modals';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useCreateDonationForm } from '@/hooks/forms';

import { uploadImage } from '@/lib/api/file';
import { COLLECTION_QUERY_KEY } from '@/lib/constants';

import { DonationCreateSearchParams } from '@/lib/types/donationRequest';

import { getApiClient } from '@lactalink/api';
import { DonationSchema, ErrorSearchParams, Individual, MilkBag } from '@lactalink/types';
import { extractCollection, extractErrorMessage, extractID } from '@lactalink/utilities';
import { useQueryClient } from '@tanstack/react-query';

import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

export default function CreateDonation() {
  //#region Hooks
  const router = useRouter();
  const queryClient = useQueryClient();
  const { matchedRequest: matchedRequestID } = useLocalSearchParams<DonationCreateSearchParams>();

  const {
    data: user,
    isFetching: isAuthFetching,
    isLoading: isAuthLoading,
    error: authError,
  } = useMeUser();

  const profile = extractCollection(user?.profile?.value);

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
  const formData = form.getValues();

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

    queryClient.invalidateQueries({
      queryKey: COLLECTION_QUERY_KEY,
    });

    router.replace('/map/explore');
  }

  async function handleValidation() {
    const isValid = await form.trigger();
    if (!isValid) {
      throw new Error('Form validation failed');
    }
  }

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <FormProvider {...form}>
      <Stack.Screen options={{ headerShown: true, title: 'Create Donation' }} />
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
                  onTriggerPress={handleValidation}
                  onConfirm={form.handleSubmit(onSubmit)}
                  isDisabled={isSubmitting}
                  title="Review Donation"
                  description={
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      className="border-outline-200"
                      style={{ maxHeight: 380, borderTopWidth: 1, borderBottomWidth: 1 }}
                    >
                      <DonationReviewCard data={formData} variant="ghost" className="p-2" />
                    </ScrollView>
                  }
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
  const { details, donor, deliveryPreferences, matchedRequest } = data;

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
            data: {
              ...data,
              status: 'AVAILABLE',
              owner: { relationTo: 'individuals', value: data.donor },
            },
          });
          docs.push(milkBagDoc);
        }
        return docs;
      })
    )
  ).flat();

  const milkSampleDocs =
    milkSample && (await Promise.all(milkSample.map((sample) => uploadImage('images', sample))));

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
      deliveryPreferences,
    },
  });

  if (matchedRequest) {
    const { requester } = await apiClient.updateByID({
      collection: 'requests',
      id: matchedRequest.id,
      data: { details: { bags: extractID(milkBagDocs) } },
    });

    const requesterName = (requester as Individual).displayName;
    return { message: `Donation created for ${requesterName}!` };
  }

  return {
    message: 'Donation created successfully!',
  };
}
