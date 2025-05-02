import Logo from '@/assets/svgs/logo.svg';
import SignInImage from '@/assets/svgs/sign-in.svg';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import GradientBackground from '@/components/ui/gradient-bg';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import React from 'react';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SignInForm from './form';

export default function SignIn() {
  const { width, height } = Dimensions.get('window');

  return (
    <SafeAreaView className="bg-background-100 relative flex flex-1 flex-col">
      <Box className="relative w-full overflow-hidden" style={{ height: height * 0.25 }}>
        <SignInImage
          width={width * 1.2}
          height={height * 0.5}
          style={{ marginLeft: -20, marginTop: -40 }}
        />

        <GradientBackground colors={['#FFF3F4', '#FE828C']} className="opacity-40" />

        <Logo style={{ width: 100, height: 60, top: 12, left: 12, position: 'absolute' }} />
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
            <Button size="md" variant="link">
              <ButtonText className="text-primary-500">Create account</ButtonText>
            </Button>
          </HStack>
        </VStack>

        <SignInForm />
      </VStack>
    </SafeAreaView>
  );
}
