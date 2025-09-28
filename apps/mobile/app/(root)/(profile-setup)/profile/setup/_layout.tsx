import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSetupForm } from '@/hooks/forms/useSetupForm';
import { Stack } from 'expo-router';
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

export default function Layout() {
  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  const { isLoading, user } = useAuth();

  const form = useSetupForm(user!); // User is guaranteed to exist here;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <FormProvider {...form}>
      <Stack screenOptions={{ headerShown: false, animation }} />
    </FormProvider>
  );
}
