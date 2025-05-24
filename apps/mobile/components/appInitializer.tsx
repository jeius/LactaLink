import { getAuth } from '@/auth';
import { useGoogleSignInConfig } from '@/hooks/useGoogleSignInConfig';
import { useApiClient } from '@lactalink/api';
import { useQuery } from '@tanstack/react-query';

import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect } from 'react';

import { QUERY_KEYS, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
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
  const { client, hasInit: clientInitialized } = useApiClient((s) => ({
    client: s.client,
    hasInit: s.hasInitialized,
  }));

  useGoogleSignInConfig();

  const { isLoading: isThemeLoading } = useTheme();
  const {
    isPending: isAuthLoading,
    error,
    data: authResult,
  } = useQuery({
    queryKey: QUERY_KEYS.AUTH.ALL,
    queryFn: getAuth,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 3,
    refetchOnMount: false,
  });

  const isAppReady = clientInitialized && !isThemeLoading && !isAuthLoading;

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  useEffect(() => {
    if (authResult && 'data' in authResult) {
      const { token } = authResult.data;
      client?.setToken(token);
      client?.setBypassToken(VERCEL_BYPASS_TOKEN);
    }
  }, [authResult, client]);

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
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  return children;
}
