import GoogleIcon from '@/assets/icons/google.svg';
import { useSession } from '@/hooks/useSession';
import React from 'react';
import { ViewProps } from 'react-native';
import { Box } from '../ui/box';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export default function GoogleButtonWrapper({ children, ...props }: ViewProps) {
  const { googleAuth } = useSession();

  function handleGoogleAuth() {
    googleAuth();
  }

  return (
    <VStack space="lg" {...props}>
      {children}

      <HStack space="sm" className="items-center">
        <Box className="bg-outline-50 h-[1px] flex-1" />
        <Text size="sm" className="text-typography-400">
          OR CONTINUE WITH
        </Text>
        <Box className="bg-outline-50 h-[1px] flex-1" />
      </HStack>

      <Button size="xl" variant="outline" onPress={handleGoogleAuth}>
        <ButtonText>Google</ButtonText>
        <ButtonIcon as={GoogleIcon} size="lg" />
      </Button>
    </VStack>
  );
}
