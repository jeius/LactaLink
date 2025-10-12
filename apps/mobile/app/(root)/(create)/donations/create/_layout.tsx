import { Form } from '@/components/contexts/FormProvider';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { useCreateDonationForm } from '@/hooks/forms/useCreateDonationForm';
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

  const form = useCreateDonationForm({
    matchedRequest: matchedRequestID,
    recipient:
      recipientID && recipientSlug ? { value: recipientID, relationTo: recipientSlug } : undefined,
  });

  const { fetchError: error, isLoading } = form;

  if (!isLoading && error) {
    const params: ErrorSearchParams = { message: error.message };
    return <Redirect href={{ pathname: '/error', params }} />;
  }

  return (
    <Form {...form}>
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
