import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';

export default function ProfileRootLayout() {
  const screenOptions = useScreenOptions();

  return (
    <Stack
      screenOptions={{
        ...screenOptions,
        headerShown: true,
      }}
    />
  );
}
