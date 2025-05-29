'use client';

import GoogleButtonWrapper from '@/components/google-button-wrapper';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInSchema } from '@lactalink/types';
import { FormProvider, useForm } from 'react-hook-form';

import { signIn } from '@/auth';
import { FormField } from '@/components/form-field';
import { extractErrorMessage } from '@lactalink/utilities';
import { useRouter } from 'expo-router';
import { LockIcon, MailIcon } from 'lucide-react-native';
import React from 'react';
import { toast } from 'sonner-native';

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(formData: SignInSchema) {
    const signInPromise = signIn(formData);

    toast.promise(signInPromise, {
      loading: 'Signing in...',
      success: (message: string) => message,
      error: (error) => extractErrorMessage(error),
    });

    await signInPromise;
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
