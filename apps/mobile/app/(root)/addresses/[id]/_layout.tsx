import { HeaderBackButton } from '@/components/HeaderBackButton';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { getColor } from '@/lib/colors';
import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  const screenOptions = useScreenOptions();

  return (
    <Stack
      screenOptions={{
        ...screenOptions,
        headerShown: true,
        headerLeft: ({ tintColor }) => <HeaderBackButton tintColor={tintColor} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Address',
        }}
      />

      <Stack.Screen
        name="edit"
        options={{
          headerTitle: 'Edit Address',
          contentStyle: { backgroundColor: getColor('background', '0') },
        }}
      />
    </Stack>
  );
}
