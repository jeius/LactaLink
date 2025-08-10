import { useAuth, useAuthListener } from '@/hooks/auth/useAuth';
import { useGoogleSignInConfig } from '@/hooks/auth/useGoogleSignInConfig';

import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect } from 'react';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useCurrentLocation } from '@/hooks/location/useLocation';
import { useOnlineManager } from '@/hooks/useOnlineManager';
import { useInitializeMarkersIndex } from '@/lib/stores/markersStore';
import { RefreshCwIcon } from 'lucide-react-native';
import LoadingSpinner from './loaders/LoadingSpinner';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type Props = {
  children: ReactNode;
};

export function AppInitializer({ children }: Props) {
  useAuthListener();
  useGoogleSignInConfig();
  useOnlineManager();

  const markers = useInitializeMarkersIndex();
  const { isLoading: isThemeLoading } = useTheme();
  const { isLoading: isAuthLoading, error: authError, refetchSession } = useAuth();
  const { isSuccess: isLocationReady, error: locationError } = useCurrentLocation();

  const isAppReady = !isThemeLoading && !isAuthLoading && isLocationReady && markers.isSuccess;
  const error = authError || locationError;

  useEffect(() => {
    if (isLocationReady) {
      console.log('✔️  Location is ready');
    }
  }, [isLocationReady]);

  useEffect(() => {
    if (!isThemeLoading) {
      console.log('✔️  Theme is loaded');
    }
  }, [isThemeLoading]);

  useEffect(() => {
    if (!isAuthLoading) {
      console.log('✔️  Auth is ready');
    }
  }, [isAuthLoading]);

  useEffect(() => {
    if (markers.isSuccess) {
      console.log('✔️  Markers index is initialized');
    }
  }, [markers.isSuccess]);

  // Hide the splash screen once the app is ready
  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (error) {
    return (
      <SafeArea className="items-center justify-center">
        <VStack space="lg" className="p-5">
          <VStack space="sm" className="items-center justify-center">
            <Text size="lg" className="font-JakartaSemiBold">
              {error.message}
            </Text>
          </VStack>
          <Button action="default" onPress={() => refetchSession()}>
            <ButtonIcon as={RefreshCwIcon} width={18} height={18} />
            <ButtonText>Refresh</ButtonText>
          </Button>
        </VStack>
      </SafeArea>
    );
  }

  if (!isAppReady) {
    return <LoadingSpinner />;
  }

  return children;
}
