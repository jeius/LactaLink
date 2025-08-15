import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function InventoryLayout() {
  const screenOptions = useScreenOptions({ animationType: 'slide' });

  return <Stack initialRouteName="index" screenOptions={screenOptions} />;
}
