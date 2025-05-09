import Logo from '@/assets/svgs/logo.svg';
import SignInImage from '@/assets/svgs/sign-in.svg';
import SignInForm from '@/components/forms/sign-in';
import KeyboardAvoidingWrapper from '@/components/keyboard-avoider';
import { useTheme } from '@/components/providers/theme-provider';
import SafeArea from '@/components/safe-area';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getHexColor } from '@/lib/colors';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions } from 'react-native';

export default function SignIn() {
  const { width, height } = Dimensions.get('window');
  const { theme } = useTheme();
  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  return (
    <SafeArea>
      <Box className="relative w-full overflow-hidden" style={{ height: height * 0.25 }}>
        <SignInImage
          width={width * 1.2}
          height={height * 0.5}
          style={{ marginLeft: -20, marginTop: -40 }}
        />

        <GradientBackground colors={gradientColors} className="opacity-70" />

        <Icon as={Logo} className="absolute left-3 top-3 h-16 w-24" />
      </Box>

      <KeyboardAvoidingWrapper>
        <VStack className="w-full p-5">
          <VStack className="mb-4">
            <Text bold size="2xl">
              Welcome 👋
            </Text>
            <HStack space="sm" className="items-center">
              <Text size="md" className="text-typography-600">
                Don&apos;t have an account?
              </Text>
              <Button size="md" variant="link" onPress={() => router.push('/auth/sign-up')}>
                <ButtonText className="text-primary-500">Create account</ButtonText>
              </Button>
            </HStack>
          </VStack>

          <SignInForm />
        </VStack>
      </KeyboardAvoidingWrapper>
    </SafeArea>
  );
}
