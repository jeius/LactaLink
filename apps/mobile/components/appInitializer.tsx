import { useGoogleSignInConfig } from '@/hooks/useGoogleSignInConfig';

import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect } from 'react';

import { useAuth } from '@/hooks/auth/useSession';
import { useTheme } from './providers/theme-provider';
import SafeArea from './safe-area';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type Props = {
  children: ReactNode;
};

export function AppInitializer({ children }: Props) {
  useGoogleSignInConfig();
  const { isLoading: isThemeLoading } = useTheme();
  const { isLoading: isAuthLoading, error } = useAuth();

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
      <SafeArea>
        <Text size="sm">{error.message}</Text>
      </SafeArea>
    );
  }

  if (!isAppReady) {
    return (
      <SafeArea>
        <Spinner size="large" />
      </SafeArea>
    );
  }

  return children;
}
