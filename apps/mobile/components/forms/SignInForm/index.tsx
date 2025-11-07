'use client';

import GoogleButtonWrapper from '@/components/GoogleButtonWrapper';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInSchema } from '@lactalink/form-schemas';
import { useForm } from 'react-hook-form';

import { signIn } from '@/auth';
import { Form } from '@/components/contexts/FormProvider';
import { TextInputField } from '@/components/form-fields/TextInputField';
import { Box } from '@/components/ui/box';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { useRouter } from 'expo-router';
import { LockIcon, MailIcon } from 'lucide-react-native';
import React from 'react';
import { toast } from 'sonner-native';

export default function SignInForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(formData: SignInSchema) {
    const signInPromise = signIn(formData);

    toast.dismiss();

    toast.promise(signInPromise, {
      loading: 'Signing in...',
      success: (message: string) => message,
      error: (error) => extractErrorMessage(error),
    });

    await signInPromise;
  }

  return (
    <Form {...form}>
      <VStack space="lg" className="flex-1 items-stretch">
        <TextInputField
          control={form.control}
          name="email"
          label="Email"
          inputProps={{
            placeholder: 'Enter email address',
            autoCorrect: false,
            autoCapitalize: 'none',
            autoComplete: 'email',
            keyboardType: 'email-address',
            icon: MailIcon,
            iconClassName: 'text-primary-500',
          }}
        />

        <VStack space="md">
          <TextInputField
            control={form.control}
            name="password"
            label="Password"
            inputProps={{
              placeholder: 'Enter your password',
              autoCorrect: false,
              autoCapitalize: 'none',
              autoComplete: 'current-password',
              type: 'password',
              icon: LockIcon,
              iconClassName: 'text-primary-500',
            }}
          />

          <HStack>
            <Button
              variant="link"
              size="sm"
              action="default"
              className="px-0"
              isDisabled={isSubmitting}
              onPress={() => {
                router.push('/auth/forgot-password');
              }}
            >
              <ButtonText className="font-JakartaMedium">Forgot Password?</ButtonText>
            </Button>
          </HStack>
        </VStack>

        <Box className="grow" />

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
    </Form>
  );
}
