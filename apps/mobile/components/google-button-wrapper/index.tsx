import GoogleIcon from '@/assets/icons/google.svg';
import { useSession } from '@/hooks/auth/useSession';
import { useAppToast } from '@/hooks/useAppToast';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
  const toast = useAppToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogleAuth() {
    setIsSubmitting(true);
    toast.show({
      id: 'google-auth',
      type: 'loading',
      message: 'Authenticating with google...',
    });

    const authRes = await googleAuth().finally(() => {
      setIsSubmitting(false);
    });

    if ('error' in authRes) {
      toast.show({
        id: 'google-auth',
        type: 'error',
        message: authRes.error.message,
      });
      return;
    }

    toast.show({
      id: 'google-auth',
      type: 'success',
      message: 'Welcome! 👋',
    });

    router.replace('/home');
  }

  return (
    <VStack aria-disabled={isSubmitting || disabled} space="lg" {...props}>
      {children}

      <HStack space="sm" className="items-center">
        <Divider orientation="horizontal" className="flex-1" />
        <Text size="sm" className="text-typography-500">
          OR CONTINUE WITH
        </Text>
        <Divider orientation="horizontal" className="flex-1" />
      </HStack>

      <Button
        isDisabled={isSubmitting || disabled}
        size="xl"
        variant="outline"
        onPress={handleGoogleAuth}
      >
        <ButtonText>Google</ButtonText>
        <ButtonIcon as={GoogleIcon} size="lg" />
      </Button>
    </VStack>
  );
}
