import { useSetupForm } from '@/hooks/forms/useSetupForm';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';
import React from 'react';
import { FormProvider } from 'react-hook-form';

export default function Layout() {
  const screenOptions = useScreenOptions();

  const form = useSetupForm();

  return (
    <FormProvider {...form}>
      <Stack screenOptions={screenOptions} />
    </FormProvider>
  );
}
