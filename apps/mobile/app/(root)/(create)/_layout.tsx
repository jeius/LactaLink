import { HeaderBackButton } from '@/components/HeaderBackButton';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function CreateLayout() {
  const screenOptions = useScreenOptions();

  return (
    <Stack
      screenOptions={{
        ...screenOptions,
        headerShown: true,
        headerLeft: ({ tintColor }) => <HeaderBackButton tintColor={tintColor} />,
      }}
    >
      <Stack.Screen name="requests/create" options={{ headerShown: true, title: 'New Request' }} />
    </Stack>
  );
}
