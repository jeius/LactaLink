import { useSession } from '@/hooks/auth/useSession';
import { useSetupForm } from '@/hooks/forms/useSetupForm';
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

export default function Layout() {
  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  const { user } = useSession();
  const { form } = useSetupForm();

  if (!user) {
    return <Redirect href={'/auth/sign-in'} />;
  }

  if (user.profile) {
    return <Redirect href={'/home'} />;
  }

  return (
    <FormProvider {...form}>
      <Stack screenOptions={{ headerShown: false, animation }} />
    </FormProvider>
  );
}
