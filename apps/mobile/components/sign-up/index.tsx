import { zodResolver } from '@hookform/resolvers/zod';

import React, { useRef } from 'react';
import { ControllerProps, useForm } from 'react-hook-form';
import { Dimensions } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

import { useSession } from '@/hooks/useSession';
import { router } from 'expo-router';

import { Toast, ToastTitle, useToast } from '@/components/ui/toast';
import { API_URL } from '@/lib/constants';
import { signUpSchema, SignUpSchema } from '@/lib/types';
import { isEmailTaken } from '@lactalink/utilities';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HStack } from '../ui/hstack';
import { Spinner } from '../ui/spinner';
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

  async function onSubmit(formData: SignUpSchema) {
    toast.show({
      id: 'sign-up',
      duration: null,
      placement: 'top',
      render: ({ id }) => (
        <SafeAreaView>
          <Toast
            nativeID={`toast-${id}`}
            variant="solid"
            action="muted"
            className="shadow-hard-5 p-5"
            style={{ width: width * 0.9 }}
          >
            <HStack space="sm" className="mx-auto">
              <Spinner size="small" color={'#F0EBEB'} />
              <ToastTitle>Creating account...</ToastTitle>
            </HStack>
          </Toast>
        </SafeAreaView>
      ),
    });

    const result = await isEmailTaken({ email: formData.email, apiUrl: API_URL });

    if (result === true) {
      form.setError('email', { message: 'Email already taken.', type: 'duplicate' });
      carouselRef.current?.scrollTo({ index: 0, animated: true });
      toast.close('sign-up');
      return;
    } else if (typeof result === 'string') {
      toast.show({
        id: 'sign-up',
        duration: 3000,
        placement: 'top',
        render: ({ id }) => (
          <SafeAreaView>
            <Toast
              nativeID={`toast-${id}`}
              variant="solid"
              action="error"
              className="shadow-hard-5 gap-4 p-5"
              style={{ width: width * 0.9 }}
            >
              <ToastTitle className="text-center">{result}</ToastTitle>
            </Toast>
          </SafeAreaView>
        ),
      });
      return;
    }

    const { user, message } = await signUp(formData);
    if (user) {
      toast.show({
        id: 'sign-up',
        duration: 3000,
        placement: 'top',
        render: ({ id }) => (
          <SafeAreaView>
            <Toast
              nativeID={`toast-${id}`}
              variant="solid"
              action="success"
              className="shadow-hard-5 gap-4 p-5"
              style={{ width: width * 0.9 }}
            >
              <ToastTitle className="text-center">🎉 Account created.</ToastTitle>
            </Toast>
          </SafeAreaView>
        ),
      });
      router.push('./(auth)/verify-otp');
    } else {
      toast.show({
        id: 'sign-up',
        duration: 3000,
        placement: 'top',
        render: ({ id }) => (
          <SafeAreaView>
            <Toast
              nativeID={`toast-${id}`}
              variant="solid"
              action="error"
              className="shadow-hard-5 gap-4 p-5"
              style={{ width: width * 0.9 }}
            >
              <ToastTitle className="text-center">{message}</ToastTitle>
            </Toast>
          </SafeAreaView>
        ),
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
