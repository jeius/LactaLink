import { useAuth } from '@/hooks/auth/useAuth';
import { useGoogleSignInConfig } from '@/hooks/auth/useGoogleSignInConfig';

import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect } from 'react';

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
      <SafeArea className="items-center justify-center">
        <Text size="sm">{error.message}</Text>
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
