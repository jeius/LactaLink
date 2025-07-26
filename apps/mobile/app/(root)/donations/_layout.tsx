import { ScrollProvider } from '@/components/contexts/ScrollProvider';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  const screenOptions = useScreenOptions();

  return (
    <ScrollProvider>
      <Stack
        initialRouteName="index"
        screenOptions={{
          ...screenOptions,
          headerShown: true,
          headerLeft: () => <HeaderBackButton />,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerTitle: 'Donations', headerShadowVisible: false }}
        />

        <Stack.Screen name="create" options={{ headerTitle: 'Create Donation' }} />
      </Stack>
    </ScrollProvider>
  );
}
