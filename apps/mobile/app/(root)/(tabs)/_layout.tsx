import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="home/index" options={{ headerShown: false }} />
    </Stack>
  );
}
