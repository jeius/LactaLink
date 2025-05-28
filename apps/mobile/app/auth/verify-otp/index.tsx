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
import { getHexColor } from '@/lib/colors';
import { ASSET_IMAGES } from '@/lib/constants/images';
import type { VerifyOtp, VerifyOtpSearchParams } from '@lactalink/types';

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Dimensions } from 'react-native';

export default function VerifyOTP() {
  const { height } = Dimensions.get('window');
  const { theme } = useTheme();
  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  const searchParams = useLocalSearchParams<VerifyOtpSearchParams>();
  const recipient = 'email' in searchParams ? searchParams.email : searchParams.phone;
  const params: VerifyOtp = { ...searchParams };

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
                <Text size="md" className="text-typography-700">
                  A six digit code has been sent to{' '}
                  <Text bold className="text-typography-700">
                    {recipient}
                  </Text>
                  .
                </Text>
              </HStack>
            </VStack>
          </VStack>

          <Box className="p-5">
            <OTPForm {...params} />
          </Box>

          <VStack className="mx-auto items-center p-5">
            <Text size="sm" className="text-typography-600">
              Didn&apos;t receive the verification code?
            </Text>
            <SendAgain {...params} />
          </VStack>
        </Card>
      </KeyboardAvoidingWrapper>
    </SafeArea>
  );
}
