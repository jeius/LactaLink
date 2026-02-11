import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  const screenOptions = useScreenOptions();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="[id]/index"
        options={{
          headerShown: true,
          headerTitle: 'Address',
        }}
      />
    </Stack>
  );
}
