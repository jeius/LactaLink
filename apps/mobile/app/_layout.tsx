import { AppInitializer } from '@/components/appInitializer';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import '@/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GluestackUIProvider mode="light">
          <AppInitializer>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(root)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AppInitializer>
        </GluestackUIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
