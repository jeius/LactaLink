import { getAuth } from '@/auth';
import { useGoogleSignInConfig } from '@/hooks/useGoogleSignInConfig';
import { useQuery } from '@tanstack/react-query';

import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect } from 'react';

import { useFontsLoader } from '@/hooks/useFontsLoader';
import { getHexColor } from '@/lib/colors';
import { QUERY_KEYS } from '@/lib/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './providers/theme-provider';
import { Spinner } from './ui/spinner';
import { Text } from './ui/text';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type Props = {
  children: ReactNode;
};

export function AppInitializer({ children }: Props) {
  useGoogleSignInConfig();
  const [fontsLoaded, error] = useFontsLoader();
  const { isLoading: isThemeLoading, theme } = useTheme();

  const { isPending: isAuthLoading } = useQuery({
    queryKey: QUERY_KEYS.AUTH.ALL,
    queryFn: getAuth,
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const isAppReady = fontsLoaded && !isThemeLoading && !isAuthLoading;

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (error) {
    console.log(error);
    return (
      <SafeAreaView className="bg-background-50 flex-1 items-center justify-center">
        <Text size="sm">{error.message}</Text>
      </SafeAreaView>
    );
  }

  if (!isAppReady) {
    return (
      <SafeAreaView className="bg-background-50 flex-1 items-center justify-center">
        <Spinner color={getHexColor(theme, 'primary', 500)} size="large" />
      </SafeAreaView>
    );
  }

  return children;
}
