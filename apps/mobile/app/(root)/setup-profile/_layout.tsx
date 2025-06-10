import SafeArea from '@/components/safe-area';
import { Spinner } from '@/components/ui/spinner';
import { useCheckAuth } from '@/hooks/auth/useCheckAuth';
import { useSetupForm } from '@/hooks/forms/useSetupForm';
import { Stack } from 'expo-router';
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

export default function Layout() {
  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  const { isLoading, user } = useCheckAuth();

  const form = useSetupForm(user!);

  if (isLoading) {
    return (
      <SafeArea className="items-center justify-center">
        <Spinner size={'large'} />
      </SafeArea>
    );
  }

  return (
    <FormProvider {...form}>
      <Stack screenOptions={{ headerShown: false, animation }} />
    </FormProvider>
  );
}
