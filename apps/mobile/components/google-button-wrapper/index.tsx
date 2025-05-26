import GoogleIcon from '@/assets/icons/google.svg';
import { useAuth } from '@/hooks/auth/useSession';
import { useAppToast } from '@/hooks/useAppToast';
import { SIGN_IN_WITH_OAUTH_TOAST_ID } from '@/lib/constants';
import { extractErrorMessage } from '@lactalink/utilities';
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
  const { signInWithGoogle } = useAuth();
  const toast = useAppToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogleAuth() {
    setIsSubmitting(true);
    toast.show({
      id: SIGN_IN_WITH_OAUTH_TOAST_ID,
      type: 'loading',
      message: 'Authenticating with google...',
    });

    try {
      const user = await signInWithGoogle();

      let name = user.email;

      if (user.profile) {
        const profile = user.profile.value;
        if (typeof profile === 'object') {
          if ('name' in profile) {
            name = profile.name;
          } else {
            name = profile.givenName;
          }
        }
      }

      toast.show({
        id: SIGN_IN_WITH_OAUTH_TOAST_ID,
        message: `👋 Welcome! ${name}`,
        type: 'success',
      });

      router.replace('/home');
    } catch (error) {
      toast.show({
        id: SIGN_IN_WITH_OAUTH_TOAST_ID,
        type: 'error',
        message: extractErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
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
