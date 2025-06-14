import { DeliveryDetailsForm } from '@/components/forms/donation-request/DeliveryDetailsForm';
import { DonationDetailsForm } from '@/components/forms/donation-request/DonationDetailsForm';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';

import { usePagination } from '@/hooks/forms/usePagination';

import { DONATION_DETAILS_FIELDS, DONATION_STEPS } from '@/lib/constants/donationRequest';
import { DonationFields, DonationSteps, DonationStepsParams } from '@/lib/types/donationRequest';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { useApiClient } from '@lactalink/api';
import { CreateDonationSchema } from '@lactalink/types';

import { useLocalSearchParams } from 'expo-router';
import { FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { ScrollView } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

const STEPS = createDynamicRoute('/donations/create', DONATION_STEPS);

type Block = Record<DonationSteps, FC>;

export default function CreateDonation() {
  const apiClient = useApiClient();
  const [showToast, setShowToast] = useState(false);
  const { step, recipientId } = useLocalSearchParams<DonationStepsParams>();
  const { nextPage, hasNextPage, prevPage, hasPrevPage, pages } = usePagination(STEPS, {
    recipientId,
  });

  const form = useFormContext<CreateDonationSchema>();
  form.setValue('recipient', recipientId);

  const block: Block = {
    details: DonationDetailsForm,
    deliveryDetails: DeliveryDetailsForm,
  };

  const RenderBlock = block[step];

  async function onSubmit(data: CreateDonationSchema) {
    console.log('Submitting Donation:', data);
  }

  async function handleNext() {
    if (!hasNextPage) {
      form.handleSubmit(onSubmit)();
      return;
    }

    const fields: DonationFields = {
      deliveryDetails: ['deliveryDetails'],
      details: DONATION_DETAILS_FIELDS,
    };

    const allValid = await form.trigger(fields[step]);

    if (allValid) {
      nextPage();
    } else {
      toast.error('There are some invalid fields. Please fix them before proceeding.');
    }
  }

  return (
    <SafeArea safeTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space="lg">
          <RenderBlock />

          <Button size="lg" className="m-5" onPress={handleNext}>
            <ButtonText>{hasNextPage ? 'Next' : 'Create'}</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}
