import { Form } from '@/components/contexts/FormProvider';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { useMeUser } from '@/hooks/auth/useAuth';
import { useCreateDonationForm } from '@/hooks/forms';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { DONATION_CREATE_STEPS } from '@/lib/constants/donationRequest';
import { DonationCreateSearchParams, DonationCreateSteps } from '@/lib/types/donationRequest';
import { ErrorSearchParams } from '@lactalink/types';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

type SearchParams = {
  step: DonationCreateSteps;
} & DonationCreateSearchParams;

export default function DonationCreateLayout() {
  const screenOptions = useScreenOptions({ animationType: 'slide' });

  const {
    matchedRequest: matchedRequestID,
    recipientID,
    recipientSlug,
    step,
  } = useLocalSearchParams<SearchParams>();

  const meUser = useMeUser();

  const {
    form,
    isLoading: isFormLoading,
    isFetching: isFormFetching,
    error: formError,
    isRefetching,
    refetch,
  } = useCreateDonationForm({
    user: meUser.data,
    matchedRequest: matchedRequestID,
    recipient:
      recipientID && recipientSlug ? { value: recipientID, relationTo: recipientSlug } : undefined,
  });

  const isLoading = meUser.isLoading || isFormLoading;
  const isFetching = meUser.isFetching || isFormFetching;
  const error = meUser.error || formError;
  const isRefetchingData = meUser.isRefetching || isRefetching;

  function handleRefresh() {
    meUser.refetch();
    refetch();
  }

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <Form
      {...form}
      isFetching={isFetching}
      isLoading={isLoading}
      fetchError={error}
      refreshing={isRefetchingData}
      onRefresh={handleRefresh}
    >
      <Stack
        screenOptions={{
          ...screenOptions,
          headerShown: true,
          headerTitle: DONATION_CREATE_STEPS[step]?.label || 'New Donation',
        }}
      />

      <FetchingSpinner isFetching={isLoading} />
    </Form>
  );
}
