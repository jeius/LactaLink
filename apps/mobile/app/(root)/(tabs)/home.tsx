import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { LogOutIcon } from 'lucide-react-native';

import { signOut } from '@/auth';
import { extractErrorMessage } from '@lactalink/utilities';
import React from 'react';
import { toast } from 'sonner-native';

import { DonateRequestModal } from '@/components/modals/DonateRequestModal';
import SafeArea from '@/components/SafeArea';
import { useAuth } from '@/hooks/auth/useAuth';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';

export default function Home() {
  const router = useRouter();

  const { user } = useAuth();

  function handleSignOut() {
    toast.promise(signOut(), {
      loading: 'Signing out...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });
  }

  return (
    <SafeArea safeTop={false} mode="margin" className="items-stretch">
      <ScrollView>
        <VStack space="lg" className="mb-20 items-center justify-center p-5">
          <DonateRequestModal />

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
              router.push('/');
            }}
          >
            <ButtonText>Go to onboarding</ButtonText>
          </Button>

          <Button
            action="default"
            onPress={() => {
              router.push('/addresses');
            }}
          >
            <ButtonText>Addresses</ButtonText>
          </Button>

          <Button
            action="default"
            onPress={() => {
              router.push('/delivery-preferences');
            }}
          >
            <ButtonText>Delivery Preferences</ButtonText>
          </Button>

          <Button
            action="default"
            onPress={() => {
              router.push('/donations');
            }}
          >
            <ButtonText>Available Donations</ButtonText>
          </Button>

          <Button
            action="default"
            onPress={() => {
              if (user) {
                router.push({
                  pathname: '/donations',
                  params: { userID: '2a5e7f8d-7149-41b6-9051-5107604ab52a' },
                });
              }
            }}
          >
            <ButtonText>My Donations</ButtonText>
          </Button>

          <Button
            action="default"
            onPress={() => {
              router.push('/requests');
            }}
          >
            <ButtonText>Requests</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}
