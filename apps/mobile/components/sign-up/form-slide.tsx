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
import { SignUpSchema } from '@/lib/types';

import {
  AlertCircleIcon,
  ChevronLeftIcon,
  EyeClosedIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
} from 'lucide-react-native';

import { RefObject, useEffect, useState } from 'react';
import { Controller, ControllerProps, UseFormReturn } from 'react-hook-form';

import { ICarouselInstance } from 'react-native-reanimated-carousel';

type FormSlideProps<T extends ControllerProps<SignUpSchema>> = {
  carouselRef: RefObject<ICarouselInstance>;
  fieldName: T['name'];
  form: UseFormReturn<SignUpSchema>;
  onSubmit: (data: SignUpSchema) => Promise<void>;
};

export function FormSlide<T extends ControllerProps<SignUpSchema>>({
  carouselRef,
  fieldName,
  form: {
    formState: { errors, isLoading, isSubmitting },
    control,
    trigger,
    handleSubmit,
    setFocus,
  },
  onSubmit,
}: FormSlideProps<T>) {
  const isEmail = fieldName === 'email';
  const isPassword = fieldName === 'password';
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (errors['email']) {
      carouselRef.current?.scrollTo({ index: 0, animated: true });
      setFocus('email');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);
  async function handleNext() {
    if (isPassword) {
      handleSubmit(onSubmit)();
    } else {
      const valid = await trigger('email');
      if (valid) carouselRef.current?.next();
    }
  }

  function handlePrev() {
    carouselRef.current?.prev();
  }

  const renderInput: T['render'] = ({ field }) => (
    <Input variant="underlined" size="lg" className="gap-2">
      <InputIcon as={isEmail ? MailIcon : LockIcon} className="text-primary-500" />
      <InputField
        type={isPassword ? (showPass ? 'text' : 'password') : 'text'}
        ref={field.ref}
        placeholder={isEmail ? 'name@example.com' : 'Enter unique password'}
        autoCorrect={false}
        autoCapitalize="none"
        autoComplete={isEmail ? 'email' : 'new-password'}
        keyboardType={isEmail ? 'email-address' : undefined}
        value={field.value}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
      />
      {isPassword && field.value && (
        <InputSlot className="px-2" onPress={() => setShowPass((prev) => !prev)}>
          <InputIcon as={showPass ? EyeIcon : EyeClosedIcon} />
        </InputSlot>
      )}
    </Input>
  );

  return (
    <VStack className="border-outline-100 mr-4 h-full rounded-xl border">
      <HStack>
        <Button
          size="sm"
          variant="link"
          action="secondary"
          className="mt-1 px-4"
          disabled={isEmail}
          onPress={handlePrev}
        >
          {isPassword && <ButtonIcon as={ChevronLeftIcon} size="sm" />}
          <ButtonText className="text-typography-400">
            {isEmail ? 'Enter your email' : 'Change email'}
          </ButtonText>
        </Button>
      </HStack>

      <VStack className="flex-1 p-5 pt-0">
        <FormControl className="flex-1" isInvalid={!!errors[fieldName]} isDisabled={isSubmitting}>
          <Controller name={fieldName} control={control} render={renderInput} />

          {isPassword && !errors.password && (
            <FormControlHelper>
              <FormControlHelperText>Enter at least 8 characters long.</FormControlHelperText>
            </FormControlHelper>
          )}

          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
            <FormControlErrorText size="sm">{errors[fieldName]?.message}</FormControlErrorText>
          </FormControlError>
        </FormControl>

        <Button size="lg" onPress={handleNext}>
          <ButtonText>
            {isLoading
              ? 'Validating...'
              : isSubmitting
                ? 'Creating...'
                : isPassword
                  ? 'Create Account'
                  : 'Continue'}
          </ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}
