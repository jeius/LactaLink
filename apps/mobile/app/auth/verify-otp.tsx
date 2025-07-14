import { useTheme } from '@/components/AppProvider/ThemeProvider';
import OTPForm from '@/components/forms/OTPForm';
import SendAgain from '@/components/forms/OTPForm/SendAgain';
import KeyboardAvoidingWrapper from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getHexColor } from '@/lib/colors';
import { getImageAsset } from '@/lib/stores';
import type { VerifyOtp, VerifyOtpSearchParams } from '@lactalink/types';

import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function VerifyOTP() {
  const { theme } = useTheme();
  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  const searchParams = useLocalSearchParams<VerifyOtpSearchParams>();
  const recipient = 'email' in searchParams ? searchParams.email : searchParams.phone;
  const params: VerifyOtp = { ...searchParams };

  return (
    <SafeArea>
      <KeyboardAvoidingWrapper contentContainerClassName="grow justify-center p-5">
        <Card className="p-0">
          <Box className="relative w-full overflow-hidden" style={{ aspectRatio: 2.25 }}>
            <Image
              contentFit="cover"
              contentPosition={{ top: '50%' }}
              style={{ height: '100%', width: '100%' }}
              alt="Phone email verification"
              source={getImageAsset('verification')}
            />

            <GradientBackground colors={gradientColors} className="opacity-40" />
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
