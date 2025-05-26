import { AppInitializer } from '@/components/appInitializer';
import AppProvider from '@/components/providers';
import '@/global.css';
import { API_URL, VERCEL_BYPASS_TOKEN } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { initApiClient } from '@lactalink/api';
import { Stack } from 'expo-router';

initApiClient({ apiUrl: API_URL, supabase, bypassToken: VERCEL_BYPASS_TOKEN });

export default function RootLayout() {
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
