import { FormField, FormFieldProps } from '@/components/form-field';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { SignUpSchema } from '@/lib/types';

import { ChevronLeftIcon } from 'lucide-react-native';

import { RefObject, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { ICarouselInstance } from 'react-native-reanimated-carousel';

type FormSlideProps = {
  carouselRef: RefObject<ICarouselInstance>;
  onSubmit: (data: SignUpSchema) => Promise<void>;
  formFieldProps: FormFieldProps<SignUpSchema>;
};

export function FormSlide({ carouselRef, formFieldProps, onSubmit }: FormSlideProps) {
  const {
    formState: { errors, isLoading, isSubmitting },
    trigger,
    handleSubmit,
    setFocus,
  } = useFormContext<SignUpSchema>();

  const isEmail = formFieldProps.name === 'email';
  const isPassword = formFieldProps.name === 'password';

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

  return (
    <VStack className="border-outline-200 mr-4 h-full rounded-xl border">
      <HStack>
        <Button
          size="sm"
          variant="link"
          action="default"
          className="mt-1 px-4"
          disabled={isEmail}
          onPress={handlePrev}
        >
          {isPassword && <ButtonIcon as={ChevronLeftIcon} size="sm" />}
          <ButtonText>{isEmail ? 'Enter your email' : 'Change email'}</ButtonText>
        </Button>
      </HStack>

      <VStack className="flex-1 p-5 pt-0">
        <FormField {...formFieldProps} />

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
