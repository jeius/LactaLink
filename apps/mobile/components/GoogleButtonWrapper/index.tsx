import { signInWithGoogle } from '@/auth';
import { ICONS } from '@/lib/constants';
import { extractErrorMessage } from '@lactalink/utilities';
import React, { useState } from 'react';
import { ViewProps } from 'react-native';
import { toast } from 'sonner-native';
import { Button, ButtonText } from '../ui/button';
import { Divider } from '../ui/divider';
import { HStack } from '../ui/hstack';
import { Image } from '../ui/image';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

export default function GoogleButtonWrapper({
  children,
  disabled,
  ...props
}: ViewProps & { disabled?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogleAuth() {
    setIsSubmitting(true);

    const googleSignInPromise = signInWithGoogle();

    toast.promise(googleSignInPromise, {
      loading: 'Signing in with Google...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });

    await googleSignInPromise;
    setIsSubmitting(false);
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
        <Image source={ICONS.googleIcon} alt="Google Icon" size="2xs" />
      </Button>
    </VStack>
  );
}
