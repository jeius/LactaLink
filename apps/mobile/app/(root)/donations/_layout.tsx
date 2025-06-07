import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

export default function Layout() {
  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create/index" />
    </Stack>
  );
}
