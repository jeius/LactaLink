import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  const { profile } = useAuth();
  const screenOptions = useScreenOptions();

  const hasProfile = Boolean(profile);

  return (
    <Stack
      initialRouteName={hasProfile ? '(drawer)' : '(profile-setup)/profile'}
      screenOptions={screenOptions}
    >
      <Stack.Protected guard={!hasProfile}>
        <Stack.Screen name="(profile-setup)/profile" />
      </Stack.Protected>
    </Stack>
  );
}
