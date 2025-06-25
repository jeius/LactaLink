import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCreateDonationForm } from '@/hooks/forms/useCreateDonationForm';
import { CollectionSlug } from '@lactalink/types';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

export default function Layout() {
  const { slug } = useLocalSearchParams<{ slug: CollectionSlug }>();

  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  const { user, isFetching, isLoading: isAuthLoading, profile } = useAuth();

  const { form: createDonationForm, isLoading: isFormLoading } = useCreateDonationForm({
    user,
    profile,
  });

  const isLoading = isAuthLoading || isFormLoading;
  const form = slug === 'donations' ? createDonationForm : createDonationForm; // Assuming the same form is used for requests, adjust as necessary;

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
