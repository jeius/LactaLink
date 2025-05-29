import { zodResolver } from '@hookform/resolvers/zod';

import { LockIcon, MailIcon } from 'lucide-react-native';
import React, { useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Dimensions } from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { FormSlide } from './form-slide';

import { FormFieldProps } from '@/components/form-field';
import { signUpSchema, SignUpSchema } from '@/lib/types';

import { signUp } from '@/auth';
import { extractAuthErrorCode, extractErrorMessage } from '@lactalink/utilities';
import { toast } from 'sonner-native';

const FIELDS: FormFieldProps<SignUpSchema>[] = [
  {
    name: 'email',
    inputType: 'text',
    placeholder: 'name@example.com',
    inputIcon: MailIcon,
    autoCapitalize: 'none',
    autoComplete: 'email',
    keyboardType: 'email-address',
  },
  {
    name: 'password',
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

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(formData: SignUpSchema) {
    toast.promise(signUp(formData), {
      loading: 'Creating account...',
      success: (msg: string) => msg,
      error: (error) => {
        const code = extractAuthErrorCode(error);
        const message = extractErrorMessage(error);
        if (code === 'email_exists') {
          form.setError('email', { message, type: 'duplicate' });
          carouselRef.current?.scrollTo({ index: 0, animated: true });
        }
        return message;
      },
    });
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
