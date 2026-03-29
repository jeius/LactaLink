import { useCreateDonationNavigator } from '@/features/donation&request/hooks/useCreateDonationNavigator';
import { DonationCreateParams, DonationCreateSteps } from '@/features/donation&request/lib/types';
import { DonationCreateResult } from '@lactalink/types/api';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import BagVerificationStep from './BagVerificationStep';
import DetailsStep from './DetailsStep';
import TutorialStep from './TutorialStep';

type SearchParams = {
  step: DonationCreateSteps;
} & DonationCreateParams;

export default function DonationCreateStepsScreen() {
  const { step, ...params } = useLocalSearchParams<SearchParams>();
  const router = useRouter();

  const { nextPage } = useCreateDonationNavigator(step);

  function onSubmit(data: DonationCreateResult | null) {
    if (!data) return;

    const donationID = data.donation.id;
    const transactionID = data.transaction?.id;

    if (transactionID) {
      router.dismissTo(`/transactions/${transactionID}`);
    } else {
      router.dismissTo(`/donations/${donationID}`);
    }
  }

  switch (step) {
    case 'details':
      return <DetailsStep onNextPress={nextPage} />;
    case 'milkbag-tutorial':
      return <TutorialStep onNextPress={nextPage} />;
    case 'milkbag-verification':
      return <BagVerificationStep onSubmit={onSubmit} />;
    default:
      return <Redirect href={{ pathname: '/donations/create', params: params }} />;
  }
}
