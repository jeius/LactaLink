'use client';

import GoogleButtonWrapper from '@/components/google-button-wrapper';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInSchema } from '@lactalink/types';
import { FormProvider, useForm } from 'react-hook-form';

import { FormField } from '@/components/form-field';
import { useAuth } from '@/hooks/auth/useSession';
import { useAppToast } from '@/hooks/useAppToast';
import { SIGN_IN_TOAST_ID } from '@/lib/constants';
import { VerifyOTPSearchParams } from '@/lib/types';
import { extractAuthErrorCode, extractErrorMessage } from '@lactalink/utilities';
import { VerifyOtpParams } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { LockIcon, MailIcon } from 'lucide-react-native';
import React from 'react';

export default function SignInForm() {
  const { signIn, sendVerification } = useAuth();
  const toast = useAppToast();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(formData: SignInSchema) {
    toast.show({
      id: SIGN_IN_TOAST_ID,
      message: 'Signing in...',
      type: 'loading',
    });

    try {
      const user = await signIn(formData);
      let name = user.email;

      if (user.profile) {
        const profile = user.profile.value;
        if (typeof profile === 'object') {
          if ('name' in profile) {
            name = profile.name;
          } else {
            name = profile.givenName;
          }
        }
      }

      toast.show({
        id: SIGN_IN_TOAST_ID,
        message: `🎉 Welcome back! ${name}`,
        type: 'success',
      });
      router.replace('/home');
    } catch (error) {
      const code = extractAuthErrorCode(error);
      if (code === 'email_not_confirmed') {
        const type: VerifyOtpParams['type'] = 'signup';
        const email = formData.email;

        try {
          await sendVerification({ email, type });

          toast.close(SIGN_IN_TOAST_ID);
          const params: VerifyOTPSearchParams = { email, type };
          router.push({ pathname: '/auth/verify-otp', params });
        } catch (err) {
          toast.show({
            id: SIGN_IN_TOAST_ID,
            message: extractErrorMessage(err),
            type: 'error',
          });
        }
      }
    }
  }

  return (
    <FormProvider {...form}>
      <VStack space="lg">
        <FormField
          name="email"
          label="Email"
          inputType="text"
          placeholder="Enter email address"
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputIcon={MailIcon}
        />

        <VStack space="md">
          <FormField
            name="password"
            label="Password"
            inputType="password"
            placeholder="Enter your password"
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="current-password"
            inputIcon={LockIcon}
          />

          <HStack>
            <Button
              variant="link"
              size="sm"
              action="secondary"
              className="justify-start"
              isDisabled={isSubmitting}
              onPress={() => {
                router.push('/auth/forgot-password');
              }}
            >
              <ButtonText className="text-typography-700 font-JakartaMedium w-min">
                Forgot Password?
              </ButtonText>
            </Button>
          </HStack>
        </VStack>

        <GoogleButtonWrapper disabled={isSubmitting} className="mt-5">
          <Button
            size="xl"
            isDisabled={isSubmitting}
            className="rounded-xl"
            onPress={form.handleSubmit(onSubmit)}
          >
            <ButtonText>{isSubmitting ? 'Signing in...' : 'Sign In'}</ButtonText>
          </Button>
        </GoogleButtonWrapper>
      </VStack>
    </FormProvider>
  );
}
