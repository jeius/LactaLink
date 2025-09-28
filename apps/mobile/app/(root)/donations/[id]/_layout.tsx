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
        headerLeft: ({ tintColor }) => <HeaderBackButton tintColor={tintColor} />,
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: 'Donation Details' }} />
    </Stack>
  );
}
