import { Form } from '@/components/contexts/FormProvider';
import FormSaver from '@/components/forms/FormSaver';
import FetchingSpinner from '@/components/loaders/FetchingSpinner';
import { useCreateDonationForm } from '@/features/donation&request/hooks/useCreateDonationForm';
import { DONATION_CREATE_STEPS } from '@/features/donation&request/lib/constants';
import { DonationCreateParams, DonationCreateSteps } from '@/features/donation&request/lib/types';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { ErrorSearchParams } from '@lactalink/types';
import { Redirect, Stack, useGlobalSearchParams } from 'expo-router';

type SearchParams = {
  step: DonationCreateSteps;
} & DonationCreateParams;

export default function DonationCreateLayout() {
  const screenOptions = useScreenOptions({ animationType: 'slide' });

  const {
    mrid: matchedRequestID,
    rid: recipientID,
    rslg: recipientSlug,
    step,
  } = useGlobalSearchParams<SearchParams>();

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
      <FormSaver schemaName="donation-create" enabled={!matchedRequestID && !recipientID} />

      <Stack
        initialRouteName="index"
        screenOptions={{
          ...screenOptions,
          headerShown: true,
          headerTitle: DONATION_CREATE_STEPS[step]?.label || 'Create Donation',
        }}
      />

      <FetchingSpinner isFetching={isLoading} />
    </Form>
  );
}
