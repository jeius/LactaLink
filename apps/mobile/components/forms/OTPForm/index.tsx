import { verifyOTP } from '@/auth';
import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getHexColor } from '@/lib/colors';

import { zodResolver } from '@hookform/resolvers/zod';

import { OtpSchema, otpSchema, VerifyOtp } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities';

import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { OtpInput } from 'react-native-otp-entry';
import { toast } from 'sonner-native';

export default function OTPForm(props: VerifyOtp) {
  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const { theme } = useTheme();

  const textColor = getHexColor(theme, 'typography', 900);
  const focusColor = getHexColor(theme, 'indicator', 'primary');
  const outlineColor = getHexColor(theme, 'outline', 200);

  async function onSubmit({ otp: token }: OtpSchema) {
    const verifyPromise = verifyOTP({ ...props, token });

    toast.promise(verifyPromise, {
      loading: 'Verifying code...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });

    await verifyPromise;
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

      <Button isDisabled={isSubmitting} size="lg" onPress={handleSubmit(onSubmit)}>
        <ButtonText>Verify</ButtonText>
      </Button>
    </VStack>
  );
}
