import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { supabase } from '@/lib/supabase';
import { errorToast, loadingToast } from '@/lib/toaster';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, OtpSchema, OTPType } from '@lactalink/types';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { OtpInput } from 'react-native-otp-entry';

export default function OTPForm({ email, type }: { email: string; type: OTPType }) {
  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit,
  } = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const toast = useToast();

  async function onSubmit({ otp }: OtpSchema) {
    toast.show({
      id: 'otp',
      duration: null,
      placement: 'top',
      render: ({ id }) => loadingToast(id, 'Verifying code...'),
    });

    const { error } = await supabase.auth.verifyOtp({ email, type, token: otp });

    if (error) {
      toast.show({
        id: 'otp',
        placement: 'top',
        render: ({ id }) => errorToast(id, error.message),
      });
    }

    toast.closeAll();
    router.replace('/setup-profile');
  }

  return (
    <VStack space="md">
      <Controller
        control={control}
        name="otp"
        render={({ field }) => (
          <OtpInput
            focusColor={'rgb(254 155 163)'}
            numberOfDigits={6}
            onTextChange={field.onChange}
            onBlur={field.onBlur}
            autoFocus={false}
            hideStick={true}
            blurOnFilled={true}
            disabled={isSubmitting}
            type="numeric"
            textInputProps={{
              accessibilityLabel: 'One-Time Password',
            }}
            textProps={{
              accessibilityRole: 'text',
              accessibilityLabel: 'OTP digit',
              allowFontScaling: false,
            }}
            theme={{
              pinCodeTextStyle: { color: 'rgb(102, 52, 56)' },
            }}
          />
        )}
      />

      <Box className="mx-auto py-2">
        <Text className="text-error-600">{errors['otp']?.message}</Text>
      </Box>

      <Button size="lg" onPress={handleSubmit(onSubmit)}>
        <ButtonText>Verify</ButtonText>
      </Button>
    </VStack>
  );
}
