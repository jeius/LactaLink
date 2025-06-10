import { useAuth } from '@/hooks/auth/useAuth';
import { useGoogleSignInConfig } from '@/hooks/auth/useGoogleSignInConfig';

import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect } from 'react';

import { RefreshCwIcon } from 'lucide-react-native';
import { useTheme } from './providers/theme-provider';
import SafeArea from './safe-area';
import { Button, ButtonIcon, ButtonText } from './ui/button';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';
import { VStack } from './ui/vstack';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type Props = {
  children: ReactNode;
};

export function AppInitializer({ children }: Props) {
  useGoogleSignInConfig();
  const { isLoading: isThemeLoading } = useTheme();
  const { isLoading: isAuthLoading, error, refetchSession } = useAuth();

  const isAppReady = !isThemeLoading && !isAuthLoading;

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
