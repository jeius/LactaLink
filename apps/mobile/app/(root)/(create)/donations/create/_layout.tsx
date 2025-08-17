import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function DonationCreateLayout() {
  const screenOptions = useScreenOptions({ animationType: 'slide' });
  return <Stack screenOptions={screenOptions} />;
}
