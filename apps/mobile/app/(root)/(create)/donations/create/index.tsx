import { DONATION_CREATE_STEPS } from '@/lib/constants/donationRequest';
import { DonationCreateSearchParams } from '@/lib/types/donationRequest';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function CreatePageRedirect() {
  const params = useLocalSearchParams<DonationCreateSearchParams>();
  const firstStep = DONATION_CREATE_STEPS.details.value;
  return <Redirect href={{ pathname: `/donations/create/${firstStep}`, params }} />;
}
