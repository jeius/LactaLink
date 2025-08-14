import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  const { profile, isLoading, isFetching } = useAuth();
  const screenOptions = useScreenOptions();

  const hasProfile = !isLoading && !isFetching && Boolean(profile);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Protected guard={hasProfile}>
        <Stack.Screen name="(drawer)" />

        <Stack.Screen name="(create)/donations/create" />
        <Stack.Screen name="(create)/requests/create" />

        <Stack.Screen name="map" />
        <Stack.Screen name="addresses" />
        <Stack.Screen name="delivery-preferences" />
      </Stack.Protected>

      <Stack.Screen name="profile" />
    </Stack>
  );
}
