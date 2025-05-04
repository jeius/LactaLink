import Logo from '@/assets/svgs/logo.svg';
import SignInImage from '@/assets/svgs/sign-in.svg';
import SignInForm from '@/components/sign-in';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignIn() {
  const { width, height } = Dimensions.get('window');

  return (
    <SafeAreaView className="bg-background-100 relative flex max-w-md flex-1 flex-col">
      <Box className="relative w-full overflow-hidden" style={{ height: height * 0.25 }}>
        <SignInImage
          width={width * 1.2}
          height={height * 0.5}
          style={{ marginLeft: -20, marginTop: -40 }}
        />

        <GradientBackground colors={['transparent', '#FFCDD1']} className="opacity-70" />

        <Icon as={Logo} className="absolute left-3 top-3 h-16 w-24" />
      </Box>

      <VStack className="w-full flex-1 p-5">
        <VStack className="mb-4">
          <Text bold size="2xl">
            Welcome 👋
          </Text>
          <HStack space="sm" className="items-center">
            <Text size="md" className="text-typography-400">
              Don&apos;t have an account?
            </Text>
            <Button size="md" variant="link" onPress={() => router.push('/(auth)/sign-up')}>
              <ButtonText className="text-primary-500">Create account</ButtonText>
            </Button>
          </HStack>
        </VStack>

        <SignInForm />
      </VStack>
    </SafeAreaView>
  );
}
