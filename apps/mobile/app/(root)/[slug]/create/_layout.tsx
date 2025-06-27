import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateDonationForm } from '@/hooks/forms/useCreateDonationForm';
import { useCreateRequestForm } from '@/hooks/forms/useCreateRequestForm';
import { CreateDonationRequestParams, DonationRequestSlug } from '@/lib/types/donationRequest';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

type SearchParams = CreateDonationRequestParams;

export default function Layout() {
  const { slug, recipientId, requestedDonorId } = useLocalSearchParams<SearchParams>();

  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  const { user, isFetching: isAuthFetching, isLoading: isAuthLoading, profile } = useAuth();

  const {
    form: createDonationForm,
    isLoading: isDonationFormLoading,
    isFetching: isDonationFormFetching,
  } = useCreateDonationForm({
    user,
    profile,
    recipientId,
  });

  const {
    form: createRequestForm,
    isLoading: isRequestFormLoading,
    isFetching: isRequestFormFetching,
  } = useCreateRequestForm({
    user,
    profile,
    requestedDonorId,
  });

  const isFormLoading = {
    donations: isDonationFormLoading,
    requests: isRequestFormLoading,
  };

  const isFormFetching = {
    donations: isDonationFormFetching,
    requests: isRequestFormFetching,
  };

  const isLoading = isAuthLoading || isFormLoading[slug];
  const isFetching = isAuthFetching || isFormFetching[slug];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form: Record<DonationRequestSlug, UseFormReturn<any>> = {
    donations: createDonationForm,
    requests: createRequestForm,
  };

  if (isLoading) {
    return (
      <SafeArea className="items-center justify-center">
        <Spinner size={'large'} />
      </SafeArea>
    );
  }

  return (
    <FormProvider {...form[slug]}>
      <Stack screenOptions={{ headerShown: false, animation }} />
      {isFetching && (
        <Box className="absolute right-3 top-3">
          <Spinner size={'small'} />
        </Box>
      )}
    </FormProvider>
  );
}
