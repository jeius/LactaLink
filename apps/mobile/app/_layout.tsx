import { AppInitializer } from '@/components/appInitializer';
import AppProvider from '@/components/providers';
import '@/global.css';
import { API_URL, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  const init = useApiClient((s) => s.init);

  useEffect(() => {
    init(API_URL, null, VERCEL_BYPASS_TOKEN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppProvider>
      <AppInitializer>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(root)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AppInitializer>
    </AppProvider>
  );
}
