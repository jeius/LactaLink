import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { Stack } from 'expo-router';
import LoadingSpinner from './loaders/LoadingSpinner';

export function App() {
  const screenOptions = useScreenOptions();
  const { user, session, isLoading } = useAuth();

  const viewedOnboarding = useOnboardingStore((s) => s.viewed);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const isAuthenticated = !!(user && session);

  let initialRoute: string = '(root)';

  if (!viewedOnboarding) {
    initialRoute = 'index';
  } else if (!isAuthenticated) {
    initialRoute = '(auth)/(entry)/auth';
  } else {
    initialRoute = '(root)';
  }

  return (
    <>
      <Stack initialRouteName={initialRoute} screenOptions={screenOptions}>
        <Stack.Protected guard={!viewedOnboarding}>
          <Stack.Screen name="index" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(root)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)/(entry)/auth" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
