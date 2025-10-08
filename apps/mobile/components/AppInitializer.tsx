import { useAuth, useAuthListener } from '@/hooks/auth/useAuth';
import { useGoogleSignInConfig } from '@/hooks/auth/useGoogleSignInConfig';

import * as SplashScreen from 'expo-splash-screen';

import { RefreshCwIcon } from 'lucide-react-native';
import { ReactNode, useEffect } from 'react';
import { SystemBars } from 'react-native-edge-to-edge';

import { useTheme } from '@/components/AppProvider/ThemeProvider';
import SafeArea from '@/components/SafeArea';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useCurrentLocation } from '@/hooks/location/useLocation';
import { useOnlineManager } from '@/hooks/useOnlineManager';
import { useInitializeMarkersIndex } from '@/lib/stores/markersStore';
import { useInitializeTutorialStore } from '@/lib/stores/tutorialStore';

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

  const { isLoading: isThemeLoading } = useTheme();
  const auth = useAuth();
  const location = useCurrentLocation();
  const markers = useInitializeMarkersIndex(Boolean(auth.session));
  const tutorialState = useInitializeTutorialStore(auth.user);

  const isAppReady =
    !isThemeLoading &&
    !auth.isLoading &&
    !location.isLoading &&
    !markers.isLoading &&
    !tutorialState.isLoading;

  const error = auth.error || location.error;

  function handleRefresh() {
    const queriesToRefetch = [
      { error: auth.error, action: auth.refetchSession },
      { error: location.error, action: location.refetch },
      { error: markers.error, action: markers.refetch },
      { error: tutorialState.error, action: tutorialState.refetch },
    ].filter((q) => Boolean(q.error));

    queriesToRefetch.forEach((q) => q.action());
  }

  useEffect(() => {
    if (!location.isLoading) {
      console.log('✔️  Location is ready');
    }
  }, [location.isLoading]);

  useEffect(() => {
    if (!isThemeLoading) {
      console.log('✔️  Theme is loaded');
    }
  }, [isThemeLoading]);

  useEffect(() => {
    if (!auth.isLoading) {
      console.log('✔️  Auth is ready');
    } else if (auth.error) {
      console.error('❌  Error during authentication:', auth.error.message);
    }
  }, [auth.isLoading, auth.error]);

  useEffect(() => {
    if (markers.isSuccess) {
      console.log('✔️  Markers index is initialized');
    } else if (markers.isError) {
      console.error('❌  Error initializing markers index:', markers.error.message);
    }
  }, [markers.isSuccess, markers.isError, markers.error]);

  useEffect(() => {
    if (tutorialState.isSuccess) {
      console.log('✔️  Tutorial state is initialized');
    } else if (tutorialState.isError) {
      console.error('❌  Error initializing tutorial state:', tutorialState.error.message);
    }
  }, [tutorialState.isSuccess, tutorialState.isError, tutorialState.error]);

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
          <Button action="default" onPress={handleRefresh}>
            <ButtonIcon as={RefreshCwIcon} width={18} height={18} />
            <ButtonText>Refresh</ButtonText>
          </Button>
        </VStack>
      </SafeArea>
    );
  }

  if (!isAppReady) {
    return (
      <>
        <SystemBars hidden={{ navigationBar: true, statusBar: true }} />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <SystemBars hidden={{ navigationBar: false, statusBar: false }} />
      {children}
    </>
  );
}
