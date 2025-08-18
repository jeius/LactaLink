import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useCreateDonationForm } from '@/hooks/forms';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { DonationCreateSearchParams } from '@/lib/types/donationRequest';
import { ErrorSearchParams } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FormProvider } from 'react-hook-form';

export default function DonationCreateLayout() {
  const screenOptions = useScreenOptions({ animationType: 'slide' });

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

  const isLoading = isAuthLoading || isFormLoading;
  const isFetching = isAuthFetching || isFormFetching;
  const error = authError || formError;

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <FormProvider {...form}>
      <Stack screenOptions={screenOptions} />

      <FetchingSpinner isFetching={isFetching || isLoading} />
    </FormProvider>
  );
}
