import { useFetchById } from '@/hooks/collections/useFetchById';
import { CollectionSlug, Donation } from '@lactalink/types';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const SLUG: CollectionSlug = 'donations';
type DataType = Donation;

export default function DonationPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, isFetching, error } = useFetchById(Boolean(id), {
    collection: SLUG,
    id,
  });

  return (
    <View>
      <Text>ViewPage</Text>
    </View>
  );
}
