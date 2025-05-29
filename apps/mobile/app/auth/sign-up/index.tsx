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

import SignUpForm from '@/components/forms/sign-up';
import KeyboardAvoidingWrapper from '@/components/keyboard-avoider';
import { useTheme } from '@/components/providers/theme-provider';
import SafeArea from '@/components/safe-area';
import { Card } from '@/components/ui/card';
import { Image } from '@/components/ui/image';
import { getHexColor } from '@/lib/colors/getColor';
import { ASSET_IMAGES } from '@/lib/constants/images';

export default function SignUp() {
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
          <Box className="relative w-full overflow-hidden" style={{ height: height * 0.2 }}>
            <Image
              size="none"
              resizeMode="cover"
              className="h-80 w-full"
              alt="Mother Breastfeeding in chair"
              source={ASSET_IMAGES.signUp}
            />
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
                <Button size="md" variant="link" onPress={() => router.push('/auth/sign-in')}>
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
        </Card>
      </KeyboardAvoidingWrapper>
    </SafeArea>
  );
}
