import { useTheme } from '@/components/AppProvider/ThemeProvider';
import SignUpForm from '@/components/forms/SignUpForm';
import GoogleButtonWrapper from '@/components/GoogleButtonWrapper';
import KeyboardAvoidingScrollView from '@/components/KeyboardAvoider';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { getHexColor } from '@/lib/colors/getColor';
import { getImageAsset } from '@/lib/stores';

import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { LayoutRectangle } from 'react-native';

export default function SignUp() {
  const { theme } = useTheme();
  const gradientColors = [
    'transparent',
    (getHexColor(theme, 'primary', 50) as string) || 'transparent',
  ] as const;

  const [{ width }, setSize] = useState<LayoutRectangle>({ x: 0, y: 0, width: 0, height: 0 });

  return (
    <SafeArea>
      <KeyboardAvoidingScrollView contentContainerClassName="p-5 justify-center grow">
        <Card className="p-0">
          <Box className="relative w-full overflow-hidden" style={{ aspectRatio: 2.25 }}>
            <Image
              contentFit="cover"
              contentPosition={{ top: 5 }}
              style={{ width: '100%', height: '100%' }}
              alt="Mother Breastfeeding in chair"
              source={getImageAsset('signUp')}
            />
            <GradientBackground colors={gradientColors} className="opacity-40" />
          </Box>

          <VStack onLayout={(e) => setSize(e.nativeEvent.layout)}>
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
                <SignUpForm carouselWidth={width} />
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
              <ButtonText className="text-primary-500">Privacy Policy</ButtonText>
            </Button>

            <Text size="sm" className="-ml-2 text-typography-600">
              .
            </Text>
          </HStack>
        </Card>
      </KeyboardAvoidingScrollView>
    </SafeArea>
  );
}
