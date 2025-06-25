import { useAuth } from '@/hooks/auth/useAuth';
import { getHexColor } from '@/lib/colors';
import { MMKV_KEYS } from '@/lib/constants';
import Storage from '@/lib/localStorage';
import { Stack } from 'expo-router';
import { useTheme } from './AppProvider/ThemeProvider';

export function App() {
  const { theme } = useTheme();
  const bgColor = getHexColor(theme, 'background', 50);

  const { user, session } = useAuth();

  const isAuthenticated = !!(user && session);

  const viewedOnboarding = Storage.getBoolean(MMKV_KEYS.ONBOARDING);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bgColor } }}>
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
