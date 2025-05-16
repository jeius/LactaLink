import { zodResolver } from '@hookform/resolvers/zod';

import React, { useRef } from 'react';
import { ControllerProps, useForm } from 'react-hook-form';
import { Dimensions } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

import { useSession } from '@/hooks/auth/useSession';
import { router } from 'expo-router';

import { useAppToast } from '@/hooks/useAppToast';
import { API_URL, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import { signUpSchema, SignUpSchema, VerifyOTPSearchParams } from '@/lib/types';
import { isEmailTaken } from '@lactalink/utilities';
import { FormSlide } from './form-slide';

const FIELD_NAMES: ControllerProps<SignUpSchema>['name'][] = ['email', 'password'];

export default function SignUpForm() {
  const carouselRef = useRef<ICarouselInstance>(null);
  const { width } = Dimensions.get('window');
  const { signUp } = useSession();
  const toast = useAppToast();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(formData: SignUpSchema) {
    toast.show({
      id: 'sign-up',
      message: 'Creating...',
      type: 'loading',
    });

    const emailTaken = await isEmailTaken({
      email: formData.email,
      apiUrl: API_URL,
      vercelToken: VERCEL_BYPASS_TOKEN,
    });

    if (emailTaken === true) {
      form.setError('email', { message: 'Email already taken.', type: 'duplicate' });
      carouselRef.current?.scrollTo({ index: 0, animated: true });

      toast.close('sign-up');
      return;
    } else if (typeof emailTaken === 'string') {
      toast.show({
        id: 'sign-up',
        message: emailTaken,
        type: 'error',
      });
      return;
    }

    const { user, message } = await signUp(formData);

    if (user) {
      toast.show({
        id: 'sign-up',
        message: '🎉 Account created.',
        type: 'success',
      });

      const params: VerifyOTPSearchParams = { email: formData.email, type: 'signup' };
      router.push({ pathname: '/auth/verify-otp', params });
    } else {
      toast.show({
        id: 'sign-up',
        type: 'error',
        message,
      });
    }
  }

  return (
    <Carousel
      ref={carouselRef}
      loop={false}
      data={FIELD_NAMES}
      width={width * 0.84}
      height={180}
      scrollAnimationDuration={300}
      renderItem={({ item }) => (
        <FormSlide
          key={item}
          carouselRef={carouselRef}
          fieldName={item}
          form={form}
          onSubmit={onSubmit}
        />
      )}
    />
  );
}
