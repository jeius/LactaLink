import { getAuth } from '@/auth/getAuth';
import { useGoogleSignInConfig } from '@/hooks/useGoogleSignInConfig';
import { useQuery } from '@tanstack/react-query';

import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect } from 'react';

import { useFontsLoader } from '@/hooks/useFontsLoader';
import { QUERY_KEYS } from '@/lib/constants';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from './providers/theme-provider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

type Props = {
  children: ReactNode;
};

export function AppInitializer({ children }: Props) {
  useGoogleSignInConfig();
  const [fontsLoaded, error] = useFontsLoader();
  const { isLoading: isThemeLoading } = useTheme();

  const { isPending: isAuthLoading, data } = useQuery({
    queryKey: QUERY_KEYS.AUTH.ALL,
    queryFn: getAuth,
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const user = data?.user;

  const isAppReady = fontsLoaded && !isThemeLoading && !isAuthLoading;

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (error) {
    console.log(error);
    return (
      <View className="bg-primary-100 flex-1 items-center justify-center">
        <Text className="font-sans text-sm">{error.message}</Text>
      </View>
    );
  }

  // if (isAppReady && !user) {
  //   return <Redirect href="./(auth)/sign-in" />;
  // }

  if (!isAppReady) {
    return (
      <View className="bg-primary-100 flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}
