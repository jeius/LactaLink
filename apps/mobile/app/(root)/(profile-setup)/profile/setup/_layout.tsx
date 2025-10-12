import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSetupForm } from '@/hooks/forms/useSetupForm';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';
import { FormProvider } from 'react-hook-form';

export default function Layout() {
  const screenOptions = useScreenOptions();

  const { isLoading, user } = useAuth();

  const form = useSetupForm(user!); // User is guaranteed to exist here;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <FormProvider {...form}>
      <Stack screenOptions={screenOptions} />
    </FormProvider>
  );
}
