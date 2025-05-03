import { zodResolver } from '@hookform/resolvers/zod';

import React, { useRef } from 'react';
import { ControllerProps, useForm } from 'react-hook-form';
import { Dimensions } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

import { useSession } from '@/hooks/useSession';
import { router } from 'expo-router';

import { useToast } from '@/components/ui/toast';
import { API_URL } from '@/lib/constants';
import { signUpSchema, SignUpSchema } from '@/lib/types';
import { isEmailTaken } from '@lactalink/utilities';
import { FormSlide } from './form-slide';

const FIELD_NAMES: ControllerProps<SignUpSchema>['name'][] = ['email', 'password'];

export default function SignUpForm() {
  const carouselRef = useRef<ICarouselInstance>(null);
  const { width } = Dimensions.get('window');
  const { signUp } = useSession();
  const toast = useToast();

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: 'onSubmit',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (formData: SignUpSchema) => {
    const result = await isEmailTaken({ email: formData.email, apiUrl: API_URL });

    if (result === true) {
      form.setError('email', { message: 'Email already taken.', type: 'duplicate' });
      carouselRef.current?.scrollTo({ index: 0, animated: true });
      return;
    } else if (typeof result === 'string') {
      //error toast
      return;
    }

    const { user, message } = await signUp(formData);
    if (user) {
      router.push('./(auth)/verify-otp');
    } else {
      //error toast
      console.log('Signup failed:', message);
    }
  };

  return (
    <Carousel
      ref={carouselRef}
      loop={false}
      data={FIELD_NAMES}
      width={width * 0.85}
      height={width * 0.41}
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
