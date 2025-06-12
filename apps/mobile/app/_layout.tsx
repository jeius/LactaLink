import { AppInitializer } from '@/components/AppInitializer';
import AppProvider from '@/components/AppProvider';
import '@/global.css';
import { API_URL, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { initApiClient } from '@lactalink/api';
import { ApiClientConfig } from '@lactalink/types';
import { Stack } from 'expo-router';

const config: ApiClientConfig = {
  apiUrl: API_URL,
  supabase,
  environment: 'expo',
  bypassToken: VERCEL_BYPASS_TOKEN,
};

initApiClient(config);

export default function RootLayout() {
  return (
    <AppProvider>
      <AppInitializer>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(root)" />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="error" />
        </Stack>
      </AppInitializer>
    </AppProvider>
  );
}
