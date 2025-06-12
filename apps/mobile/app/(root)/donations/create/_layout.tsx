import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { useCheckAuth } from '@/hooks/auth/useCheckAuth';
import { useCreateDonationForm } from '@/hooks/forms/useCreateDonationForm';
import { Stack } from 'expo-router';
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

export default function Layout() {
  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  const { user, isFetching, isLoading, profile } = useCheckAuth();
  const form = useCreateDonationForm({ user, profile });

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
      {isFetching && (
        <Box className="absolute right-3 top-3">
          <Spinner size={'small'} />
        </Box>
      )}
    </FormProvider>
  );
}
