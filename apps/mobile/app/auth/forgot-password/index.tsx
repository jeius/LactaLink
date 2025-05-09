import Logo from '@/assets/svgs/logo.svg';
import VerifyImage from '@/assets/svgs/verification.svg';
import KeyboardAvoidingWrapper from '@/components/keyboard-avoider';
import { useTheme } from '@/components/providers/theme-provider';
import SafeArea from '@/components/safe-area';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from '@/components/ui/form-control';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { getHexColor } from '@/lib/colors';
import { supabase } from '@/lib/supabase';
import { errorToast, loadingToast } from '@/lib/toaster';
import { zodResolver } from '@hookform/resolvers/zod';
import { emailSchema } from '@lactalink/types';
import { VerifyOtpParams } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { AlertCircleIcon, ChevronLeftIcon, MailIcon } from 'lucide-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Dimensions } from 'react-native';
import { z } from 'zod';

const schema = z.object({ email: emailSchema });
type Schema = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { width, height } = Dimensions.get('window');
  const toast = useToast();
  const { theme } = useTheme();

  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  async function onSubmit({ email }: Schema) {
    toast.show({
      id: 'forgot-password',
      duration: null,
      placement: 'top',
      render: ({ id }) => loadingToast(id, 'Requesting reset...', theme),
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      toast.show({
        id: 'forgot-password',
        placement: 'top',
        render: ({ id }) => errorToast(id, error.message),
      });
      return;
    }

    const type: VerifyOtpParams['type'] = 'recovery';
    router.push({ pathname: '/auth/verify-otp', params: { email, type } });
  }

  return (
    <SafeArea className="p-5">
      <KeyboardAvoidingWrapper>
        <VStack className="my-auto items-start justify-center">
          <VStack className="bg-background-0 border-outline-100 w-full max-w-md overflow-hidden rounded-2xl border">
            <Box className="relative w-full overflow-hidden" style={{ height: height * 0.2 }}>
              <VerifyImage width={width} height={height * 0.2} style={{ marginLeft: -20 }} />

              <GradientBackground colors={gradientColors} className="opacity-40" />

              <Icon as={Logo} className="absolute left-3 top-3 h-16 w-24" />
            </Box>

            <VStack>
              <VStack space="sm" className="p-5">
                <Text bold size="2xl">
                  Forgot your password?
                </Text>
                <HStack className="flex-wrap items-center">
                  <Text size="md" className="text-typography-700">
                    Enter the email address that you want to reset the password.
                  </Text>
                </HStack>
              </VStack>
            </VStack>

            <VStack space="3xl" className="p-5 pt-0">
              <FormControl isInvalid={!!errors['email']}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field, field: { disabled } }) => (
                    <Input
                      isDisabled={disabled}
                      size="md"
                      variant="underlined"
                      className="gap-2 rounded-xl px-2"
                    >
                      <InputIcon as={MailIcon} className="text-primary-500" />
                      <InputField
                        type="text"
                        autoCapitalize="none"
                        autoComplete="email"
                        placeholder="name@example.com"
                        keyboardType="email-address"
                        onChangeText={field.onChange}
                        value={field.value}
                        onBlur={field.onBlur}
                      />
                    </Input>
                  )}
                />

                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} size="sm" />
                  <FormControlErrorText size="sm">{errors['email']?.message}</FormControlErrorText>
                </FormControlError>
              </FormControl>

              <Button
                isDisabled={isSubmitting}
                size="xl"
                variant="solid"
                action="primary"
                onPress={handleSubmit(onSubmit)}
              >
                <ButtonText>{isSubmitting ? 'Requesting...' : 'Request Reset'}</ButtonText>
              </Button>
            </VStack>
          </VStack>

          {router.canGoBack() && (
            <Button variant="link" action="default" size="md" onPress={() => router.back()}>
              <ButtonIcon as={ChevronLeftIcon} />
              <ButtonText>Back to sign in</ButtonText>
            </Button>
          )}
        </VStack>
      </KeyboardAvoidingWrapper>
    </SafeArea>
  );
}
