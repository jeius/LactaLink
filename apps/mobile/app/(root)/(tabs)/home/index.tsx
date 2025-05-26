import { Protected } from '@/components/protected';
import ThemeToggler from '@/components/theme-toggler';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/auth/useSession';
import { useAppToast } from '@/hooks/useAppToast';
import { LogOutIcon } from 'lucide-react-native';

import * as crypto from 'expo-crypto';

import React from 'react';

const Home = () => {
  const { signOut } = useAuth();
  const toast = useAppToast();

  return (
    <Protected>
      <ThemeToggler />
      <VStack space="lg" className="items-center">
        <Button
          action="default"
          onPress={() => {
            signOut();
          }}
        >
          <ButtonText>Sign out</ButtonText>
          <ButtonIcon as={LogOutIcon} />
        </Button>

        <Button
          action="secondary"
          onPress={() => {
            toast.show({ id: crypto.randomUUID(), type: 'loading' });
          }}
        >
          <ButtonText>Show loading toast</ButtonText>
        </Button>
      </VStack>
    </Protected>
  );
};

export default Home;
