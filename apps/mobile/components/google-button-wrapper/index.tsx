import GoogleIcon from '@/assets/icons/google.svg';
import { useSession } from '@/hooks/useSession';
import { errorToast, loadingToast, successToast } from '@/lib/toaster';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ViewProps } from 'react-native';
import { useTheme } from '../providers/theme-provider';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Text } from '../ui/text';
import { useToast } from '../ui/toast';
import { VStack } from '../ui/vstack';

export default function GoogleButtonWrapper({
  children,
  disabled,
  ...props
}: ViewProps & { disabled?: boolean }) {
  const { googleAuth } = useSession();
  const toast = useToast();
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogleAuth() {
    setIsSubmitting(true);
    toast.show({
      id: 'google-auth',
      placement: 'top',
      duration: null,
      render: ({ id }) => loadingToast(id, 'Authenticating with google...', theme),
    });

    const authRes = await googleAuth();

    setIsSubmitting(false);

    if (!authRes.user) {
      toast.show({
        id: 'google-auth',
        placement: 'top',
        duration: 3000,
        render: ({ id }) => errorToast(id, authRes.message),
      });
      return;
    }

    toast.show({
      id: 'google-auth',
      placement: 'top',
      duration: 3000,
      render: ({ id }) => successToast(id, 'Welcome! 👋'),
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
