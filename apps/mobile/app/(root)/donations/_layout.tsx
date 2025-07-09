import Avatar from '@/components/Avatar';
import { HeaderBackButton } from '@/components/HeaderBackButton';
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
        headerShown: true,
        headerLeft: () => <HeaderBackButton />,
        headerRight: () => <Avatar />,
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: 'Donations' }} />

      <Stack.Screen name="create" options={{ headerTitle: 'Create Donation' }} />
    </Stack>
  );
}
