import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { Stack, usePathname } from 'expo-router';
import LoadingSpinner from './loaders/LoadingSpinner';

const restrictedOnValidAuth = ['/auth/sign-up', '/auth/sign-in', '/auth/forgot-password'];

export function App() {
  const screenOptions = useScreenOptions();
  const pathname = usePathname();
  const { user, session, isLoading } = useAuth();

  const viewedOnboarding = useOnboardingStore((s) => s.viewed);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const isAuthenticated = !!(user && session);
  const isRestrictedOnValidAuth = restrictedOnValidAuth.includes(pathname);

  let initialRoute: string = '(root)';

  if (!viewedOnboarding) {
    initialRoute = 'index';
  } else if (!isAuthenticated) {
    initialRoute = 'auth';
  }

  return (
    <>
      <Stack
        initialRouteName={initialRoute}
        screenOptions={{
          ...screenOptions,
        }}
      >
        <Stack.Protected guard={!viewedOnboarding}>
          <Stack.Screen name="index" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(root)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated || !isRestrictedOnValidAuth}>
          <Stack.Screen name="auth" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
