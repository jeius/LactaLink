import { useTheme } from '@/components/AppProvider/ThemeProvider';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import KeyboardAvoidingWrapper from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { getHexColor } from '@/lib/colors';
import { getImageAsset } from '@/lib/stores';

import { Image } from 'expo-image';

import React from 'react';
import { Dimensions } from 'react-native';

export default function ResetPassword() {
  const { height } = Dimensions.get('window');
  const { theme } = useTheme();

  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  return (
    <SafeArea className="items-stretch">
      <KeyboardAvoidingWrapper contentContainerStyle={{ justifyContent: 'center' }}>
        <Card className="m-5 p-0">
          <VStack>
            <Box className="relative w-full overflow-hidden" style={{ height: height * 0.25 }}>
              <Image
                contentFit="cover"
                contentPosition={{ top: 5 }}
                style={{ height: '100%', width: '100%' }}
                alt="Forgot Password Image"
                source={getImageAsset('forgotPassword')}
              />
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
