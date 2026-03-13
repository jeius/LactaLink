import { zodResolver } from '@hookform/resolvers/zod';

import { LockIcon, MailIcon } from 'lucide-react-native';
import React, { useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { FormSlide } from './FormSlide';

import { signUp } from '@/auth';
import { TextInputFieldProps } from '@/components/form-fields/TextInputField';
import { extractAuthErrorCode, extractErrorMessage } from '@lactalink/utilities/extractors';
import { toast } from 'sonner-native';
import { SignUpSchema, signUpSchema } from './schema';

const FIELDS: TextInputFieldProps<SignUpSchema>[] = [
  {
    name: 'email',
    contentPosition: 'first',
    inputProps: {
      placeholder: 'name@example.com',
      icon: MailIcon,
      autoCapitalize: 'none',
      autoComplete: 'email',
      keyboardType: 'email-address',
      type: 'text',
      'aria-label': 'Enter your email address',
    },
  },
  {
    name: 'password',
    helperText: 'Enter at least 8 characters long.',
    contentPosition: 'first',
    inputProps: {
      placeholder: 'Enter unique password',
      autoComplete: 'new-password',
      autoCapitalize: 'none',
      icon: LockIcon,
      type: 'password',
      'aria-label': 'Enter your unique password',
    },
  },
];

export default function SignUpForm({ carouselWidth }: { carouselWidth: number }) {
  const carouselRef = useRef<ICarouselInstance>(null);

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(formData: SignUpSchema) {
    const signUpPromise = signUp(formData);

    toast.promise(signUpPromise, {
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

    await signUpPromise;
  }

  return (
    <FormProvider {...form}>
      <Carousel
        ref={carouselRef}
        loop={false}
        data={FIELDS}
        style={{ height: 180 }}
        itemWidth={carouselWidth - 40}
        scrollAnimationDuration={300}
        enabled={false}
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
