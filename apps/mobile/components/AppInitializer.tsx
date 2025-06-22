import { useAuth } from '@/hooks/auth/useAuth';
import { useGoogleSignInConfig } from '@/hooks/auth/useGoogleSignInConfig';

import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect } from 'react';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAssetsLoader } from '@/hooks/loaders/useAssetsLoader';
import { useCurrentLocation } from '@/hooks/location/useLocation';
import { RefreshCwIcon } from 'lucide-react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type Props = {
  children: ReactNode;
};

export function AppInitializer({ children }: Props) {
  useGoogleSignInConfig();
  const { isLoading: isThemeLoading } = useTheme();
  const { isLoading: isAuthLoading, error: authError, refetchSession } = useAuth();
  const { isSuccess: isLocationReady, error: locationError } = useCurrentLocation();
  const { isSuccess: areAssetsReady, error: assetsError, data } = useAssetsLoader();

  const isAppReady = !isThemeLoading && !isAuthLoading && isLocationReady && areAssetsReady;
  const error = authError || locationError || assetsError;

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
    if (areAssetsReady) {
      console.log('✔️  All Assets are loaded');
    }
  }, [areAssetsReady, data]);

  // Hide the splash screen once the app is ready
  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (error) {
    console.warn(error);
    return (
      <SafeArea className="items-center justify-center">
        <VStack space="lg">
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
    return (
      <SafeArea className="items-center justify-center">
        <Spinner size="large" />
      </SafeArea>
    );
  }

  return children;
}
