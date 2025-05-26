import { zodResolver } from '@hookform/resolvers/zod';

import React, { useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Dimensions } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

import { useAuth } from '@/hooks/auth/useSession';
import { router } from 'expo-router';

import { FormFieldProps } from '@/components/form-field';
import { useAppToast } from '@/hooks/useAppToast';
import { SIGN_UP_TOAST_ID } from '@/lib/constants';
import { signUpSchema, SignUpSchema, VerifyOTPSearchParams } from '@/lib/types';
import { useApiClient } from '@lactalink/api';
import { extractErrorMessage } from '@lactalink/utilities';
import { LockIcon, MailIcon } from 'lucide-react-native';
import { FormSlide } from './form-slide';

const FIELDS: FormFieldProps<SignUpSchema>[] = [
  {
    name: 'email',
    label: 'Email',
    inputType: 'text',
    placeholder: 'name@example.com',
    inputIcon: MailIcon,
    autoCapitalize: 'none',
    autoComplete: 'email',
    keyboardType: 'email-address',
  },
  {
    name: 'password',
    label: 'Password',
    inputType: 'password',
    placeholder: 'Enter unique password',
    helperText: 'Enter at least 8 characters long.',
    autoComplete: 'new-password',
    autoCapitalize: 'none',
    inputIcon: LockIcon,
  },
];

export default function SignUpForm() {
  const carouselRef = useRef<ICarouselInstance>(null);
  const { width } = Dimensions.get('window');
  const { signUp } = useAuth();
  const toast = useAppToast();
  const apiClient = useApiClient();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(formData: SignUpSchema) {
    toast.show({
      id: SIGN_UP_TOAST_ID,
      message: 'Creating account...',
      type: 'loading',
    });

    try {
      const existingUsers = await apiClient.find({
        collection: 'users',
        pagination: false,
        select: { email: true },
        where: { email: { equals: formData.email } },
      });

      if (existingUsers.length > 0) {
        form.setError('email', { message: 'Email already taken.', type: 'duplicate' });
        carouselRef.current?.scrollTo({ index: 0, animated: true });

        toast.close(SIGN_UP_TOAST_ID);
        return;
      }

      await signUp(formData);

      toast.show({
        id: SIGN_UP_TOAST_ID,
        message: '🎉 Account created.',
        type: 'success',
      });

      const params: VerifyOTPSearchParams = { email: formData.email, type: 'signup' };
      router.push({ pathname: '/auth/verify-otp', params });
    } catch (error) {
      toast.show({
        id: SIGN_UP_TOAST_ID,
        message: extractErrorMessage(error),
        type: 'error',
      });
    }
  }

  return (
    <FormProvider {...form}>
      <Carousel
        ref={carouselRef}
        loop={false}
        data={FIELDS}
        width={width * 0.84}
        height={180}
        scrollAnimationDuration={300}
        renderItem={({ item }) => (
          <FormSlide
            key={item.name}
            carouselRef={carouselRef}
            formFieldProps={item}
            onSubmit={onSubmit}
          />
        )}
      />
    </FormProvider>
  );
}
