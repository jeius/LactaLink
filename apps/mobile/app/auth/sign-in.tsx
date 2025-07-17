import Logo from '@/assets/svgs/logo.svg';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import SignInForm from '@/components/forms/SignInForm';
import KeyboardAvoidingWrapper from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { getHexColor } from '@/lib/colors';
import { getImageAsset } from '@/lib/stores';

import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';

export default function SignIn() {
  const { theme } = useTheme();
  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  return (
    <SafeArea>
      <KeyboardAvoidingWrapper contentContainerClassName="grow">
        <Box className="relative w-full overflow-hidden" style={{ aspectRatio: 2.25 }}>
          <Image
            contentFit="cover"
            contentPosition={{ top: 5 }}
            style={{ height: '100%', width: '100%' }}
            alt="Mother Breastfeeding"
            source={getImageAsset('signIn')}
          />

          <GradientBackground colors={gradientColors} className="opacity-70" />

          <Icon as={Logo} className="absolute left-3 top-3 h-16 w-24" />
        </Box>

        <VStack className="w-full flex-1 p-5">
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
