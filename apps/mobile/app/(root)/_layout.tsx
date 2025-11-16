import { HeaderBackButton } from '@/components/HeaderBackButton';
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

      <Stack.Screen
        name="feed/comments"
        options={{
          animation: 'slide_from_bottom',
          headerShown: false,
          presentation: 'transparentModal',
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />

      <Stack.Screen
        name="(create)/requests/create"
        options={{
          title: 'New Request',
          headerShown: true,
          headerLeft: ({ tintColor }) => <HeaderBackButton tintColor={tintColor} />,
        }}
      />

      <Stack.Screen name="(create)/donations/create" options={{ headerShown: false }} />

      <Stack.Screen
        name="(create)/addresses/create"
        options={{
          headerShown: true,
          headerTitle: 'New Address',
          headerLeft: ({ tintColor }) => <HeaderBackButton tintColor={tintColor} />,
        }}
      />

      <Stack.Screen
        name="(create)/delivery-preferences/create"
        options={{
          headerShown: true,
          headerTitle: 'New Delivery Preference',
          headerLeft: ({ tintColor }) => <HeaderBackButton tintColor={tintColor} />,
        }}
      />

      <Stack.Screen
        name="(create)/delivery-proposal"
        options={{
          headerShown: false,
          presentation: 'transparentModal',
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
