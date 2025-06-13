import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { signOut } from '@/auth';
import { usePagination } from '@/hooks/forms/usePagination';

import { ICONS } from '@/lib/constants';
import { SETUP_PROFILE_STEPS } from '@/lib/constants/setupProfile';
import { createDynamicRoute } from '@/lib/utils/createDynamicRoute';

import { extractErrorMessage } from '@lactalink/utilities';
import { LogOutIcon, Settings2Icon } from 'lucide-react-native';
import React from 'react';
import { toast } from 'sonner-native';

const STEPS = createDynamicRoute('/setup-profile', SETUP_PROFILE_STEPS);

export default function Setup() {
  const { nextPage } = usePagination(STEPS);

  function handleSignOut() {
    toast.promise(signOut(), {
      loading: 'Signing out...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });
  }
  return (
    <SafeArea className="justify-center">
      <HStack className="w-full px-2">
        <Button action="default" variant="link" onPress={handleSignOut}>
          <ButtonIcon as={LogOutIcon} />
          <ButtonText>Sign out</ButtonText>
        </Button>
      </HStack>
      <Card className="m-5">
        <VStack space="2xl">
          <VStack className="items-center">
            <Image source={ICONS.verifiedAccount} alt="Verified Icon" size="sm" />
            <Text size="2xl" bold className="mt-2">
              Account Verified
            </Text>
            <Text size="sm" className="text-typography-700">
              Welcome to LactaLink 👋
            </Text>
          </VStack>

          <Text size="md">
            We&apos;re excited to have you on board! Let&apos;s get your account ready.
          </Text>

          <Button size="lg" className="my-2 w-full" onPress={nextPage}>
            <ButtonIcon as={Settings2Icon} />
            <ButtonText>Setup Account</ButtonText>
          </Button>
        </VStack>
      </Card>
    </SafeArea>
  );
}
