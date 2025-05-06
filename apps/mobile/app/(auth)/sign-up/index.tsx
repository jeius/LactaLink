import SignUpImage from '@/assets/svgs/sign-up.svg';
import GoogleButtonWrapper from '@/components/google-button-wrapper';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SignUpForm from '@/components/forms/sign-up';
import KeyboardAvoidingWrapper from '@/components/keyboard-avoider';
import { useTheme } from '@/components/providers/theme-provider';
import ThemeToggler from '@/components/theme-toggler';
import { getHexColor } from '@/lib/colors/getColor';

export default function SignUp() {
  const { width, height } = Dimensions.get('window');
  const { theme } = useTheme();
  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 200) as string) || 'transparent',
  ] as const;

  return (
    <SafeAreaView className="bg-background-50 relative flex flex-1 p-5">
      <ThemeToggler />
      <KeyboardAvoidingWrapper>
        <VStack className="bg-background-0 border-outline-200 shadow-hard-5 m-auto w-full max-w-md overflow-hidden rounded-2xl border">
          <Box className="relative w-full overflow-hidden" style={{ height: height * 0.15 }}>
            <SignUpImage width={width} height={height * 0.3} style={{ marginLeft: -20 }} />
            <GradientBackground colors={gradientColors} className="opacity-40" />
          </Box>

          <VStack>
            <VStack className="p-5">
              <Text bold size="2xl">
                Create your account
              </Text>
              <HStack space="sm" className="items-center">
                <Text size="md" className="text-typography-600">
                  Already have an account?
                </Text>
                <Button size="md" variant="link" onPress={() => router.push('/(auth)/sign-in')}>
                  <ButtonText className="text-primary-500">Sign in</ButtonText>
                </Button>
              </HStack>
            </VStack>

            <GoogleButtonWrapper className="overflow-hidden px-5">
              <Box className="mx-auto">
                <SignUpForm />
              </Box>
            </GoogleButtonWrapper>
          </VStack>

          <HStack space="sm" className="w-full flex-wrap items-center gap-y-0 p-5">
            <Text size="sm" className="text-typography-600">
              By signing up, you agree to our
            </Text>

            <Button size="sm" variant="link">
              <ButtonText className="text-primary-500">Terms & Conditions</ButtonText>
            </Button>

            <Text size="sm" className="text-typography-600">
              and
            </Text>

            <Button size="sm" variant="link">
              <ButtonText className="text-primary-500">Privacy Policiy</ButtonText>
            </Button>

            <Text size="sm" className="text-typography-600 -ml-2">
              .
            </Text>
          </HStack>
        </VStack>
      </KeyboardAvoidingWrapper>
    </SafeAreaView>
  );
}
