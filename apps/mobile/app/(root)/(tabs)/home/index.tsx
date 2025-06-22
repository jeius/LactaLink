import { Protected } from '@/components/Protected';
import ThemeToggler from '@/components/ThemeToggler';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { LogOutIcon } from 'lucide-react-native';

import { signOut } from '@/auth';
import { extractErrorMessage } from '@lactalink/utilities';
import React from 'react';
import { toast } from 'sonner-native';

import { useRouter } from 'expo-router';

const Home = () => {
  const router = useRouter();

  function handleSignOut() {
    toast.promise(signOut(), {
      loading: 'Signing out...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });
  }

  return (
    <Protected safeTop={false} mode="margin" className="items-stretch">
      <ThemeToggler />
      <VStack space="lg" className="flex-1 items-center justify-center">
        <Button action="default" onPress={handleSignOut}>
          <ButtonText>Sign out</ButtonText>
          <ButtonIcon as={LogOutIcon} />
        </Button>

        <Button
          action="secondary"
          onPress={() => {
            router.push('/setup-profile');
          }}
        >
          <ButtonText>Go to setup profile</ButtonText>
        </Button>

        <Button
          action="default"
          onPress={() => {
            router.push('/welcome');
          }}
        >
          <ButtonText>Go to onboarding</ButtonText>
        </Button>
      </VStack>
    </Protected>
  );
};

export default Home;
