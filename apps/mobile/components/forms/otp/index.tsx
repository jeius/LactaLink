import { useTheme } from '@/components/providers/theme-provider';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useSession';
import { useAppToast } from '@/hooks/useAppToast';
import { getHexColor } from '@/lib/colors';
import { OTP_TOAST_ID } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, OtpSchema } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { OtpInput } from 'react-native-otp-entry';
import { OTPFormProps } from './type';

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
  const { verifyOtp } = useAuth();
  const textColor = getHexColor(theme, 'typography', 900);
  const focusColor = getHexColor(theme, 'indicator', 'primary');
  const outlineColor = getHexColor(theme, 'outline', 200);

  async function onSubmit({ otp }: OtpSchema) {
    toast.show({
      id: OTP_TOAST_ID,
      message: 'Verifying code...',
      type: 'loading',
    });

    try {
      if (type === 'sms' || type === 'phone_change') {
        if (phone) {
          await verifyOtp({ phone, type, token: otp });
        }
      } else {
        if (email) {
          await verifyOtp({ email, type, token: otp });
        }
      }

      toast.closeAll();

      if (type === 'recovery') {
        router.replace('/auth/reset-password');
      } else if (type === 'signup') {
        router.replace('/setup-profile');
      } else {
        router.replace('/home');
      }
    } catch (error) {
      toast.show({
        id: OTP_TOAST_ID,
        type: 'error',
        message: extractErrorMessage(error),
      });
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
