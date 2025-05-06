'use client';

import GoogleButtonWrapper from '@/components/google-button-wrapper';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';

import { zodResolver } from '@hookform/resolvers/zod';
import { OTPType, signInSchema, type SignInSchema } from '@lactalink/types';
import { Controller, useForm } from 'react-hook-form';

import { useTheme } from '@/components/providers/theme-provider';
import { useToast } from '@/components/ui/toast';
import { useSession } from '@/hooks/useSession';
import { errorToast, loadingToast, successToast } from '@/lib/toaster';
import { router } from 'expo-router';
import { AlertCircleIcon, EyeClosedIcon, EyeIcon, LockIcon, MailIcon } from 'lucide-react-native';
import React, { useState } from 'react';

export default function SignInForm() {
  const [showPass, setShowPass] = useState(false);
  const { signIn } = useSession();
  const toast = useToast();
  const { theme } = useTheme();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(formData: SignInSchema) {
    toast.show({
      id: 'sign-in',
      duration: null,
      placement: 'top',
      render: ({ id }) => loadingToast(id, 'Signing in...', theme),
    });

    const { message, user } = await signIn(formData);

    if (!user) {
      if (message.toLowerCase().includes('email not confirmed')) {
        const type: OTPType = 'signup';
        router.push({
          pathname: '/verify-otp',
          params: { email: formData.email, type },
        });
        toast.close('sign-in');
        return;
      }
      toast.show({
        id: 'sign-in',
        duration: 3000,
        placement: 'top',
        render: ({ id }) => errorToast(id, message),
      });
    } else {
      toast.show({
        id: 'sign-in',
        duration: 3000,
        placement: 'top',
        render: ({ id }) => successToast(id, '🎉 Welcome back!'),
      });
      router.replace('/home');
    }
  }

  return (
    <VStack space="lg" className="flex-1">
      <FormControl isInvalid={'email' in errors} isDisabled={isSubmitting}>
        <FormControlLabel className="mb-2">
          <FormControlLabelText>Email</FormControlLabelText>
        </FormControlLabel>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input variant="outline" size="md" className="h-12 rounded-xl">
              <InputIcon as={MailIcon} className="text-primary-500 ml-3" />
              <InputField
                type="text"
                placeholder="Enter email address"
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
              />
            </Input>
          )}
        />

        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
          <FormControlErrorText>{errors.email?.message}</FormControlErrorText>
        </FormControlError>
      </FormControl>

      <VStack space="md">
        <FormControl isInvalid={'password' in errors} isDisabled={isSubmitting}>
          <FormControlLabel className="mb-2">
            <FormControlLabelText>Password</FormControlLabelText>
          </FormControlLabel>

          <Controller
            control={control}
            rules={{ required: true }}
            name="password"
            render={({ field }) => (
              <Input variant="outline" size="md" className="h-12 rounded-xl">
                <InputIcon as={LockIcon} className="text-primary-500 ml-3" />
                <InputField
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoCorrect={false}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChangeText={field.onChange}
                />
                {field.value && (
                  <InputSlot className="pr-3" onPress={() => setShowPass(!showPass)}>
                    <InputIcon as={showPass ? EyeIcon : EyeClosedIcon} />
                  </InputSlot>
                )}
              </Input>
            )}
          />

          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
            <FormControlErrorText>{errors.password?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>

        <HStack>
          <Button
            variant="link"
            size="sm"
            action="secondary"
            className="justify-start"
            isDisabled={isSubmitting}
            onPress={() => {
              router.push('./(auth)/forgot-password/index');
            }}
          >
            <ButtonText className="text-typography-700 font-JakartaMedium w-min">
              Forgot Password?
            </ButtonText>
          </Button>
        </HStack>
      </VStack>

      <GoogleButtonWrapper disabled={isSubmitting} className="mb-2 mt-10 flex-1 justify-center">
        <Button
          size="xl"
          isDisabled={isSubmitting}
          className="rounded-xl"
          onPress={handleSubmit(onSubmit)}
        >
          <ButtonText>Sign In</ButtonText>
        </Button>
      </GoogleButtonWrapper>
    </VStack>
  );
}
