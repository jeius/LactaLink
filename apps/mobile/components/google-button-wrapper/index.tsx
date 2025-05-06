import GoogleIcon from '@/assets/icons/google.svg';
import { useSession } from '@/hooks/useSession';
import React from 'react';
import { ViewProps } from 'react-native';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export default function GoogleButtonWrapper({
  children,
  disabled,
  ...props
}: ViewProps & { disabled?: boolean }) {
  const { googleAuth } = useSession();

  function handleGoogleAuth() {
    googleAuth();
  }

  return (
    <VStack space="lg" {...props}>
      {children}

      <HStack space="sm" className="items-center">
        <Divider orientation="horizontal" className="flex-1" />
        <Text size="sm" className="text-typography-500">
          OR CONTINUE WITH
        </Text>
        <Divider orientation="horizontal" className="flex-1" />
      </HStack>

      <Button isDisabled={disabled} size="xl" variant="outline" onPress={handleGoogleAuth}>
        <ButtonText>Google</ButtonText>
        <ButtonIcon as={GoogleIcon} size="lg" />
      </Button>
    </VStack>
  );
}
