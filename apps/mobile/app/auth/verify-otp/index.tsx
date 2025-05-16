import Logo from '@/assets/svgs/logo.svg';
import OTPForm from '@/components/forms/otp';
import SendAgain from '@/components/forms/otp/sendAgain';
import KeyboardAvoidingWrapper from '@/components/keyboard-avoider';
import { useTheme } from '@/components/providers/theme-provider';
import SafeArea from '@/components/safe-area';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAppToast } from '@/hooks/useAppToast';
import { getHexColor } from '@/lib/colors';
import { ASSET_IMAGES } from '@/lib/constants/images';
import { VerifyOTPSearchParams } from '@/lib/types';

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';

export default function VerifyOTP() {
  const { height } = Dimensions.get('window');
  const toast = useAppToast();
  const { theme } = useTheme();

  const { email, phone, type } = useLocalSearchParams<VerifyOTPSearchParams>();
  const recepient = email || phone;

  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  useEffect(() => {
    if (!type) {
      toast.show({
        id: 'otp',
        message: 'Verification type not found.',
        type: 'error',
      });
      router.dismiss();
    }
  }, [toast, type]);

  return (
    <SafeArea className="p-5">
      <KeyboardAvoidingWrapper>
        <Card className="my-auto max-w-md p-0">
          <Box className="relative w-full overflow-hidden" style={{ height: height * 0.25 }}>
            <Image size="full" alt="Phone email verification" source={ASSET_IMAGES.verification} />

            <GradientBackground colors={gradientColors} className="opacity-40" />

            <Icon as={Logo} className="absolute left-3 top-3 h-16 w-24" />
          </Box>

          <VStack>
            <VStack space="sm" className="p-5">
              <Text bold size="2xl">
                Verification
              </Text>
              <HStack className="flex-wrap items-center">
                {recepient && (
                  <Text size="md" className="text-typography-700">
                    A six digit code has been sent to{' '}
                    <Text bold className="text-typography-700">
                      {recepient}
                    </Text>
                    .
                  </Text>
                )}
              </HStack>
            </VStack>
          </VStack>

          <Box className="p-5">
            <OTPForm email={email} type={type!} phone={phone} />
          </Box>

          <VStack className="mx-auto items-center p-5">
            <Text size="sm" className="text-typography-600">
              Didn&apos;t receive the verification code?
            </Text>
            <SendAgain type={type!} email={email} phone={phone} />
          </VStack>
        </Card>
      </KeyboardAvoidingWrapper>
    </SafeArea>
  );
}
