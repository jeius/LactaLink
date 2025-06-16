import { Protected } from '@/components/Protected';
import ThemeToggler from '@/components/ThemeToggler';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { LogOutIcon, MapPinIcon } from 'lucide-react-native';

import * as crypto from 'expo-crypto';

import { signOut } from '@/auth';
import { delay, extractErrorMessage } from '@lactalink/utilities';
import React from 'react';
import { toast } from 'sonner-native';

import ComboBox from '@/components/ComboBox';
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
          action="primary"
          onPress={async () => {
            toast.promise(delay(2000), {
              loading: 'Loading promise toast',
              success: () => 'Promise toast resolved',
              error: 'Promise toast rejected',
            });
          }}
        >
          <ButtonText>Show promise toast</ButtonText>
        </Button>

        <Button
          action="positive"
          onPress={() => {
            toast.success('Success', { id: crypto.randomUUID() });
          }}
        >
          <ButtonText>Show success toast</ButtonText>
        </Button>

        <Button
          action="default"
          onPress={() => {
            toast.info('Info', { id: crypto.randomUUID() });
          }}
        >
          <ButtonText>Show info toast</ButtonText>
        </Button>

        <Button
          action="negative"
          onPress={() => {
            toast.error('Error', { id: crypto.randomUUID() });
          }}
        >
          <ButtonText>Show error toast</ButtonText>
        </Button>

        <ComboBox
          collection="barangays"
          searchPath="name"
          labelPath="code"
          descriptionPath="name"
          icon={MapPinIcon}
          iconPosition="left"
        />
      </VStack>
    </Protected>
  );
};

export default Home;
