import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  const screenOptions = useScreenOptions();
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        ...screenOptions,
      }}
    >
      <Stack.Screen name="edit" options={{ headerShown: true, headerTitle: 'Edit Donation' }} />
    </Stack>
  );
}
