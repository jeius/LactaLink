import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { SignUpSchema } from './schema';

import { ChevronLeftIcon } from 'lucide-react-native';

import { RefObject, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { TextInputField, TextInputFieldProps } from '@/components/form-fields/TextInputField';
import { Box } from '@/components/ui/box';
import { ICarouselInstance } from 'react-native-reanimated-carousel';

type FormSlideProps = {
  carouselRef: RefObject<ICarouselInstance | null>;
  onSubmit: (data: SignUpSchema) => Promise<void>;
  formFieldProps: TextInputFieldProps<SignUpSchema>;
};

export function FormSlide({ carouselRef, formFieldProps, onSubmit }: FormSlideProps) {
  const {
    control,
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
  }, [carouselRef, errors, setFocus]);

  async function handleNext() {
    if (isPassword) {
      handleSubmit(onSubmit)();
    } else {
      const valid = await trigger('email');
      if (valid) carouselRef.current?.next();
      setFocus('password');
    }
  }

  function handlePrev() {
    carouselRef.current?.prev();
  }

  return (
    <VStack className="flex-1 rounded-xl border border-outline-200">
      <Button
        size="sm"
        variant="link"
        action="default"
        className="mt-1 self-start px-4"
        disabled={isEmail}
        onPress={handlePrev}
      >
        {isPassword && <ButtonIcon as={ChevronLeftIcon} size="sm" />}
        <ButtonText>{isEmail ? 'Enter your email' : 'Change email'}</ButtonText>
      </Button>

      <VStack className="flex-1 justify-between p-4 pt-2">
        <Box className="flex-1">
          <TextInputField control={control} {...formFieldProps} />
        </Box>

        <Button isDisabled={isSubmitting || isLoading} size="lg" onPress={handleNext}>
          {isSubmitting && <ButtonSpinner size={'small'} />}
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
