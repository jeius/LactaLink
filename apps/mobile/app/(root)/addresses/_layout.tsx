import { HeaderBackButton } from '@/components/HeaderBackButton';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  const screenOptions = useScreenOptions();

  return (
    <Stack
      screenOptions={{
        ...screenOptions,
        headerShown: true,
        headerLeft: () => <HeaderBackButton />,
      }}
    >
      <Stack.Screen name="create" options={{ headerTitle: 'Create Address' }} />

      <Stack.Screen name="edit/[id]" options={{ headerTitle: 'Edit Address' }} />
    </Stack>
  );
}
