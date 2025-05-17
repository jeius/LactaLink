import { useSession } from '@/hooks/auth/useSession';
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

export default function Layout() {
  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  const { user } = useSession();

  if (!user) {
    return <Redirect href={'/auth/sign-in'} />;
  }

  return <Stack screenOptions={{ headerShown: false, animation }} />;
}
