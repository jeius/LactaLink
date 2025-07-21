import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { NoData } from '@/components/NoData';
import SafeArea from '@/components/SafeArea';
import { useFetchById } from '@/hooks/collections/useFetchById';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function DonationPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, isFetching, error } = useFetchById(Boolean(id), {
    collection: 'donations',
    id,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <NoData title={`Oops! Nothing found`} />;
  }

  const {
    volume,
    matchedRequests,
    deliveryDetails,
    details,
    status,
    donor,
    remainingVolume,
    deliveries,
  } = data;

  return <SafeArea></SafeArea>;
}
