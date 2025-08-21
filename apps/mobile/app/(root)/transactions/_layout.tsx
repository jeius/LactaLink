import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function TransactionsLayout() {
  const screenOptions = useScreenOptions();
  return <Stack screenOptions={screenOptions} />;
}
