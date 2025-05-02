import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
} from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  AlertCircleIcon,
  ChevronLeftIcon,
  EyeClosedIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

import { useSession } from '@/hooks/useSession';
import { router } from 'expo-router';
import { SignUpSchema, signUpSchema } from './schema';

export default function SignUpForm() {
  const { width } = Dimensions.get('window');
  const progress = useSharedValue<number>(0);
  const ref = useRef<ICarouselInstance>(null);
  const [showPass, setShowPass] = useState(false);
  const { signUp } = useSession();

  const {
    control,
    formState: { errors, isSubmitting, isLoading },
    handleSubmit,
    trigger,
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: { email: '', password: '' },
  });

  const fields = ['email', 'password'];

  async function handleOnPress(isLastSlide: boolean) {
    if (isLastSlide) {
      handleSubmit(onSubmit)();
      return;
    }

    const isValid = await trigger('email');
    if (isValid) ref.current?.next();
  }

  async function onSubmit(formData: SignUpSchema) {
    console.log('FormData: ', formData);
    const { user, message } = await signUp(formData);

    if (user) {
      console.log('Signup success');
      router.push('./(auth)/verify-otp');
    } else {
      //Show error toast
      console.log('Signup failed:', message);
    }
  }

  return (
    <Carousel
      ref={ref}
      loop={false}
      data={fields}
      width={width * 0.85}
      height={width * 0.41}
      onProgressChange={progress}
      renderItem={({ item, index }) => {
        const isLastSlide = index === fields.length - 1;
        const isEmailField = item === 'email';
        const isPasswordField = item === 'password';

        return (
          <VStack key={index} className="border-outline-100 mr-4 h-full rounded-xl border">
            <HStack>
              <Button
                size="sm"
                variant="link"
                action="secondary"
                className="mt-1 px-4"
                disabled={isEmailField}
                onPress={() => ref.current?.prev()}
              >
                {!isEmailField && <ButtonIcon as={ChevronLeftIcon} size="sm" />}
                <ButtonText className="text-typography-400">
                  {isEmailField ? 'Enter your email' : 'Change email'}
                </ButtonText>
              </Button>
            </HStack>

            <VStack className="flex-1 p-5 pt-0">
              <FormControl className="flex-1" isInvalid={item in errors} isDisabled={isSubmitting}>
                <Controller
                  control={control}
                  name={item as 'email' | 'password'}
                  render={({ field }) => (
                    <Input variant="underlined" size="lg" className="gap-2">
                      <InputIcon
                        as={isEmailField ? MailIcon : LockIcon}
                        className="text-primary-500"
                      />
                      {isEmailField && (
                        <InputField
                          type="text"
                          ref={field.ref}
                          placeholder="name@example.com"
                          autoCorrect={false}
                          autoCapitalize="none"
                          autoComplete="email"
                          keyboardType="email-address"
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                        />
                      )}

                      {isPasswordField && (
                        <>
                          <InputField
                            type={showPass ? 'text' : 'password'}
                            ref={field.ref}
                            placeholder="Enter unique password"
                            autoCorrect={false}
                            autoCapitalize="none"
                            autoComplete="new-password"
                            value={field.value}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                          />
                          {field.value && (
                            <InputSlot className="px-2" onPress={() => setShowPass(!showPass)}>
                              <InputIcon as={showPass ? EyeIcon : EyeClosedIcon} />
                            </InputSlot>
                          )}
                        </>
                      )}
                    </Input>
                  )}
                />

                {isPasswordField && !(item in errors) && (
                  <FormControlHelper>
                    <FormControlHelperText>Enter atleast 8 characters long.</FormControlHelperText>
                  </FormControlHelper>
                )}

                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                  <FormControlErrorText size="sm">
                    {errors[item as 'email' | 'password']?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              <Button size="lg" onPress={() => handleOnPress(isLastSlide)}>
                <ButtonText>
                  {isLoading
                    ? 'Validating...'
                    : isSubmitting
                      ? 'Creating...'
                      : isLastSlide
                        ? 'Create Account'
                        : 'Continue'}
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        );
      }}
    />
  );
}
