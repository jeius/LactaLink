import { useTheme } from '@/components/providers/theme-provider';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useSession } from '@/hooks/auth/useSession';
import { useAppToast } from '@/hooks/useAppToast';
import { getHexColor } from '@/lib/colors';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, OtpSchema } from '@lactalink/types';
import { AuthResponse, VerifyOtpParams } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { OtpInput } from 'react-native-otp-entry';

type OTPFormProps = { email?: string; phone?: string; type: VerifyOtpParams['type'] };

export default function OTPForm({ email, type, phone }: OTPFormProps) {
  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit,
  } = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const toast = useAppToast();
  const { theme } = useTheme();
  const { refetchSession } = useSession();
  const textColor = getHexColor(theme, 'typography', 900);
  const focusColor = getHexColor(theme, 'indicator', 'primary');
  const outlineColor = getHexColor(theme, 'outline', 200);

  async function onSubmit({ otp }: OtpSchema) {
    toast.show({
      id: 'otp',
      message: 'Verifying code...',
      type: 'loading',
    });

    let authResponse: AuthResponse | null = null;

    if (type === 'sms' || type === 'phone_change') {
      if (phone) {
        authResponse = await supabase.auth.verifyOtp({ phone, type, token: otp });
      }
    } else {
      if (email) {
        authResponse = await supabase.auth.verifyOtp({ email, type, token: otp });
      }
    }

    if (!authResponse) return;

    if (authResponse.error) {
      toast.show({
        id: 'otp',
        type: 'error',
        message: authResponse.error.message,
      });
      return;
    }

    await refetchSession();

    if (type === 'recovery') {
      router.replace('/auth/reset-password');
    } else if (type === 'signup') {
      router.replace('/setup-profile');
    } else {
      router.replace('/home');
    }
  }

  return (
    <VStack space="md">
      <Controller
        control={control}
        name="otp"
        render={({ field }) => (
          <OtpInput
            focusColor={focusColor}
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
              pinCodeTextStyle: { color: textColor },
              pinCodeContainerStyle: { borderColor: outlineColor },
            }}
          />
        )}
      />

      <Box className="mx-auto py-2">
        <Text className="text-error-500">{errors['otp']?.message}</Text>
      </Box>

      <Button size="lg" onPress={handleSubmit(onSubmit)}>
        <ButtonText>Verify</ButtonText>
      </Button>
    </VStack>
  );
}
