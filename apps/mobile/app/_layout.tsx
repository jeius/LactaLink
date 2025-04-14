import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ThemeProvider } from '@/components/ui/theme-provider';
import '@/global.css';
import { useGoogleSignInConfig } from '@/hooks/useGoogleSignInConfig';
import { useLoadedFonts } from '@/hooks/useLoadedFonts';
import { Stack } from 'expo-router';

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useLoadedFonts();

  useGoogleSignInConfig();

  // useEffect(() => {
  //   if (loaded) {
  //     SplashScreen.hideAsync();
  //   }
  // }, [loaded]);

  // if (!loaded) {
  //   return null;
  // }

  return (
    <ThemeProvider>
      <GluestackUIProvider mode="light">
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GluestackUIProvider>
    </ThemeProvider>
  );
}
