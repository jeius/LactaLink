import ThemeToggler from '@/components/ThemeToggler';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { VStack } from '@/components/ui/vstack';
import { LogOutIcon } from 'lucide-react-native';

import { signOut } from '@/auth';
import { extractErrorMessage } from '@lactalink/utilities';
import React from 'react';
import { toast } from 'sonner-native';

import { DonateRequestModal } from '@/components/DonateRequestModal';
import { MapTileButton } from '@/components/map/MapTileButton';
import SafeArea from '@/components/SafeArea';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { useCurrentLocation } from '@/hooks/location/useLocation';
import { useRouter } from 'expo-router';
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
      <VStack space="lg" className="flex-1 items-center justify-center">
        <Box className="h-28 w-40">
          <MapTileButton coordinates={coordinates} />
        </Box>

        <DonateRequestModal
          trigger={
            <Box className="border-primary-400 rounded-full border p-3">
              <Text>Donate or Request</Text>
            </Box>
          }
        />

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
    </SafeArea>
  );
}
