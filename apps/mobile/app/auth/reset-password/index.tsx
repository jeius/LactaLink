import ForgotPassImage from '@/assets/svgs/forgot-password.svg';
import ResetPasswordForm from '@/components/forms/reset-password';
import KeyboardAvoidingWrapper from '@/components/keyboard-avoider';
import { useTheme } from '@/components/providers/theme-provider';
import SafeArea from '@/components/safe-area';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getHexColor } from '@/lib/colors';
import React from 'react';
import { Dimensions } from 'react-native';

export default function ResetPassword() {
  const { width, height } = Dimensions.get('window');
  const { theme } = useTheme();

  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  return (
    <SafeArea className="justify-center p-5">
      <KeyboardAvoidingWrapper>
        <Card className="my-auto p-0">
          <VStack>
            <Box className="relative w-full overflow-hidden" style={{ height: height * 0.2 }}>
              <ForgotPassImage width={width} height={height * 0.2} style={{ marginLeft: -20 }} />
              <GradientBackground colors={gradientColors} className="opacity-40" />
            </Box>
          </VStack>

          <VStack space="2xl" className="p-5">
            <VStack space="sm">
              <Text bold size="2xl">
                Reset your password
              </Text>
              <Text size="md" className="text-typography-700">
                Enter your new password.
              </Text>
            </VStack>

            <ResetPasswordForm />
          </VStack>
        </Card>
      </KeyboardAvoidingWrapper>
    </SafeArea>
  );
}
