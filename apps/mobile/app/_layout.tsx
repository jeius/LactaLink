import { AppInitializer } from '@/components/appInitializer';
import AppProvider from '@/components/providers';
import '@/global.css';
import { Stack } from 'expo-router';

export default function RootLayout() {
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
