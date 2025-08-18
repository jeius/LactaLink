import { DONATION_CREATE_STEPS } from '@/lib/constants/donationRequest';
import { Redirect } from 'expo-router';
import React from 'react';

export default function CreatePageRedirect() {
  return <Redirect href={`/donations/create/${DONATION_CREATE_STEPS.details.value}`} />;
}
