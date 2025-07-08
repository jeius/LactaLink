import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateDonationForm } from '@/hooks/forms/useCreateDonationForm';
import { useCreateRequestForm } from '@/hooks/forms/useCreateRequestForm';
import { DonationRequestParams, DonationRequestSlug } from '@/lib/types/donationRequest';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

type SearchParams = DonationRequestParams;

export default function Layout() {
  const searchParams = useLocalSearchParams<SearchParams>();

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
    matchedRequest: searchParams.slug === 'donations' ? searchParams.matchedRequest : undefined,
  });

  const {
    form: createRequestForm,
    isLoading: isRequestFormLoading,
    isFetching: isRequestFormFetching,
  } = useCreateRequestForm({
    user,
    profile,
    requestedDonorId: searchParams.slug === 'requests' ? searchParams.requestedDonorId : undefined,
  });

  const isFormLoading = {
    donations: isDonationFormLoading,
    requests: isRequestFormLoading,
  };

  const isFormFetching = {
    donations: isDonationFormFetching,
    requests: isRequestFormFetching,
  };

  const isLoading = isAuthLoading || isFormLoading[searchParams.slug];
  const isFetching = isAuthFetching || isFormFetching[searchParams.slug];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form: Record<DonationRequestSlug, UseFormReturn<any>> = {
    donations: createDonationForm,
    requests: createRequestForm,
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <FormProvider {...form[searchParams.slug]}>
      <Stack screenOptions={{ headerShown: false, animation }} />
      <FetchingSpinner isFetching={isFetching} />
    </FormProvider>
  );
}
