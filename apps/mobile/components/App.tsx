import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import { Stack, usePathname } from 'expo-router';
import { HeaderBackButton } from './HeaderBackButton';
import FetchingSpinner from './loaders/FetchingSpinner';
import LoadingSpinner from './loaders/LoadingSpinner';

export function App() {
  const screenOptions = useScreenOptions();
  const pathname = usePathname();
  const { user, session, isLoading, isFetching } = useAuth();

  const viewedOnboarding = useOnboardingStore((s) => s.viewed);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const isAuthenticated = !!(user && session);
  const isResettingPassword = pathname.includes('/auth/reset-password');

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
          headerLeft: ({ tintColor }) => <HeaderBackButton tintColor={tintColor} />,
        }}
      >
        <Stack.Protected guard={isAuthenticated && !isResettingPassword}>
          <Stack.Protected guard={!viewedOnboarding}>
            <Stack.Screen name="index" />
          </Stack.Protected>

          <Stack.Screen name="(root)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated || isResettingPassword}>
          <Stack.Screen name="auth" />
        </Stack.Protected>
      </Stack>
      <FetchingSpinner isFetching={isFetching} />
    </>
  );
}
