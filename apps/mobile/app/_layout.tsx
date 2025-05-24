import { AppInitializer } from '@/components/appInitializer';
import AppProvider from '@/components/providers';
import '@/global.css';
import { API_URL } from '@/lib/constants';
import { useApiClient } from '@lactalink/api';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
  const init = useApiClient((s) => s.init);

  useEffect(() => {
    init(API_URL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppProvider>
      <AppInitializer>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(root)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AppInitializer>
    </AppProvider>
  );
}
