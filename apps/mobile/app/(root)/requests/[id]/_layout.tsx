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
        headerLeft: ({ tintColor }) => <HeaderBackButton tintColor={tintColor} />,
      }}
    >
      <Stack.Screen name="edit" options={{ headerShown: true, headerTitle: 'Edit Request' }} />
    </Stack>
  );
}
