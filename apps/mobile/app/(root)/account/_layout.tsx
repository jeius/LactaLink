import { HeaderBackButton } from '@/components/HeaderBackButton';
import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  const screenOptions = useScreenOptions();
  const { profileCollection } = useAuth();
  const isOrganization = profileCollection === 'hospitals' || profileCollection === 'milkBanks';

  return (
    <Stack
      screenOptions={{
        ...screenOptions,
        headerShown: true,
        headerLeft: () => <HeaderBackButton />,
      }}
    >
      <Stack.Protected guard={isOrganization}>
        <Stack.Screen name="inventory" options={{ headerTitle: 'Milk Inventory' }} />
      </Stack.Protected>

      <Stack.Screen name="index" options={{ headerTitle: 'Account' }} />
    </Stack>
  );
}
