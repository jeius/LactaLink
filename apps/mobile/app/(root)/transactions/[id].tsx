import SafeArea from '@/components/SafeArea';
import { Text } from '@/components/ui/text';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function TransactionPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeArea safeTop={false}>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Transaction' }} />
      <Text>Transaction ID: {id}</Text>
    </SafeArea>
  );
}
