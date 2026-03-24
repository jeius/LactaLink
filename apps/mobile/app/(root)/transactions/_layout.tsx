import { useScreenFormSheetOptions, useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function TransactionsLayout() {
  const screenOptions = useScreenOptions();
  const formSheetOptions = useScreenFormSheetOptions();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="propose" options={formSheetOptions} />
    </Stack>
  );
}
