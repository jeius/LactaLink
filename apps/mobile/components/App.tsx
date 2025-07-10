import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { MMKV_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { Stack } from 'expo-router';
import { HeaderBackButton } from './HeaderBackButton';

export function App() {
  const screenOptions = useScreenOptions();

  const { user, session } = useAuth();

  const isAuthenticated = !!(user && session);

  const viewedOnboarding = Storage.getBoolean(MMKV_KEYS.ONBOARDING);

  return (
    <Stack screenOptions={{ ...screenOptions, headerLeft: () => <HeaderBackButton /> }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Protected guard={!viewedOnboarding}>
          <Stack.Screen name="index" />
        </Stack.Protected>

        <Stack.Screen name="(root)" />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="auth" />
      </Stack.Protected>
    </Stack>
  );
}
