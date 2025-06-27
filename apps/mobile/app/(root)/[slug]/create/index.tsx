import { CreateDonationRequestParams } from '@/lib/types/donationRequest';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

type SearchParams = Omit<CreateDonationRequestParams, 'step'>;

export default function Page() {
  const { recipientId } = useLocalSearchParams<SearchParams>();

  if (!recipientId) {
    return <Redirect href="/donations/create/details" />;
  }

  return <Redirect href={`/donations/create/details?recipientId=${recipientId}`} />;
}
