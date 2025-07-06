import ThemeToggler from '@/components/ThemeToggler';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { LogOutIcon } from 'lucide-react-native';

import { signOut } from '@/auth';
import { extractErrorMessage } from '@lactalink/utilities';
import React from 'react';
import { toast } from 'sonner-native';

import { CreateDonationRequestButton } from '@/components/CreateDonationRequestButton';
import SafeArea from '@/components/SafeArea';
import { useCurrentLocation } from '@/hooks/location/useLocation';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native-gesture-handler';
import { LatLng } from 'react-native-maps';

export default function Home() {
  const router = useRouter();
  const { location } = useCurrentLocation();
  const coordinates: LatLng = {
    latitude: location?.coords.latitude || 0,
    longitude: location?.coords.longitude || 0,
  };

  function handleSignOut() {
    toast.promise(signOut(), {
      loading: 'Signing out...',
      success: (msg) => msg,
      error: (error) => extractErrorMessage(error),
    });
  }

  return (
    <SafeArea safeTop={false} mode="margin" className="items-stretch">
      <ThemeToggler />

      <ScrollView>
        <VStack space="lg" className="mb-20 items-center justify-center p-5">
          <CreateDonationRequestButton />

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
        </VStack>
      </ScrollView>
    </SafeArea>
  );
}
