import Verified from '@/assets/icons/account-verified.svg';
import { VStack } from '@/components/ui/vstack';

import SafeArea from '@/components/safe-area';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useSession } from '@/hooks/useSession';
import { router } from 'expo-router';
import { LogOutIcon, Settings2Icon } from 'lucide-react-native';
import React from 'react';

export default function Setup() {
  const { signOut } = useSession();

  function handlePress() {
    router.push('/setup-profile/form');
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/auth/sign-in');
  }

  return (
    <SafeArea className="justify-center p-5">
      <Button variant="link" action="default" className="ml-auto" onPress={handleSignOut}>
        <ButtonText>Sign out</ButtonText>
        <ButtonIcon as={LogOutIcon} />
      </Button>

      <VStack
        space="2xl"
        className="border-outline-100 bg-background-0 shadow-hard-5 items-center rounded-2xl border p-5"
      >
        <VStack className="items-center">
          <Verified height={64} width={64} />
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

        <Button size="lg" className="my-2 w-full" onPress={handlePress}>
          <ButtonIcon as={Settings2Icon} />
          <ButtonText>Setup Account</ButtonText>
        </Button>
      </VStack>
    </SafeArea>
  );
}
