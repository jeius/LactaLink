import SafeArea from '@/components/safe-area';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSetupForm } from '@/hooks/forms/useSetupForm';
import { router, Stack, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { Platform } from 'react-native';
import { StackAnimationTypes } from 'react-native-screens';

export default function Layout() {
  const isIOS = Platform.OS === 'ios';
  const animation: StackAnimationTypes = isIOS ? 'ios_from_right' : 'slide_from_right';

  const { user, isFetching, isLoading, session } = useAuth();
  const form = useSetupForm();

  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isFetching) {
      // Redirect to sign-in if no user is found and not already on the sign-in page
      if (!user && !session && !pathname.includes('/auth/sign-in')) {
        console.log('No user found, redirecting to sign-in');
        router.dismissTo('/auth/sign-in');
      }
      // If user exists and profile is already setup, redirect to home
      if (user && user.profile && !pathname.includes('/setup-profile')) {
        router.dismissTo('/home');
      }
    }
  }, [user, isLoading, session, isFetching, pathname]);

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
        <Box className="absolute right-3 top-0">
          <SafeArea>
            <Spinner size={'small'} />
          </SafeArea>
        </Box>
      )}
    </FormProvider>
  );
}
