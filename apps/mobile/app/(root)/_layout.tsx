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
      initialRouteName={hasProfile ? '(drawer)' : '(profile-setup)/profile/setup'}
      screenOptions={screenOptions}
    >
      <Stack.Protected guard={!hasProfile}>
        <Stack.Screen name="(profile-setup)/profile/setup" />
      </Stack.Protected>

      <Stack.Screen
        name="feed/comments"
        options={{
          animation: 'slide_from_bottom',
          presentation: 'transparentModal',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />

      <Stack.Screen
        name="(create)/requests/create"
        options={{ headerShown: true, title: 'New Request' }}
      />

      <Stack.Screen name="(create)/donations/create" />

      <Stack.Screen
        name="(create)/delivery-preferences/create"
        options={{ headerShown: true, title: 'New Delivery Preference' }}
      />

      <Stack.Screen
        name="(create)/feed/create"
        options={{ headerShown: true, title: 'Create Post' }}
      />

      <Stack.Screen name="(create)/conversations/create" />
    </Stack>
  );
}
