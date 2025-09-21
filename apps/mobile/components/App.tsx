import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { MMKV_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { Stack, usePathname } from 'expo-router';
import { HeaderBackButton } from './HeaderBackButton';
import FetchingSpinner from './loaders/FetchingSpinner';
import LoadingSpinner from './loaders/LoadingSpinner';

export function App() {
  const screenOptions = useScreenOptions();
  const pathname = usePathname();
  const { user, session, isLoading, isFetching } = useAuth();

  const isAuthenticated = !!(user && session);
  const isResettingPassword = pathname.includes('/auth/reset-password');

  const viewedOnboarding = Storage.getBoolean(MMKV_KEYS.ONBOARDING) || false;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Stack
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
