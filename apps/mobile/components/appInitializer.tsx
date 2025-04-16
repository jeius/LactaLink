import { CheckAuth } from '@/auth/checkAuth';
import '@/global.css';
import { useGoogleSignInConfig } from '@/hooks/useGoogleSignInConfig';
import { useLoadedFonts } from '@/hooks/useLoadedFonts';
import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

type Props = {
  children: ReactNode;
};

export function AppInitializer({ children }: Props) {
  useGoogleSignInConfig();
  const [fontsLoaded] = useLoadedFonts();

  const { isPending: isAuthLoading, data } = useQuery({
    queryKey: ['auth'],
    queryFn: CheckAuth,
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const user = data?.user;

  const isAppReady = fontsLoaded && !isAuthLoading;

  if (isAppReady && !user) {
    return <Redirect href="./(auth)/sign-in" />;
  }

  if (!isAppReady) {
    return (
      <View className="bg-primary-200 flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
