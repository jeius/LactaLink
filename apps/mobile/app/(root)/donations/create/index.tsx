import { DonationStepsParams } from '@/lib/types/donationRequest';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function Page() {
  const { recipientId } = useLocalSearchParams<Omit<DonationStepsParams, 'step'>>();

  if (!recipientId) {
    return <Redirect href="/donations/create/details" />;
  }

  return <Redirect href={`/donations/create/details?recipientId=${recipientId}`} />;
}
