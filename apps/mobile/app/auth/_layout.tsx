import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { getHexColor } from '@/lib/colors';
import { Stack } from 'expo-router';

export default function Layout() {
  const { theme } = useTheme();
  const bgColor = getHexColor(theme, 'background', 50);
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bgColor } }}>
      <Stack.Screen name="sign-up/index" />
      <Stack.Screen name="sign-in/index" />
      <Stack.Screen name="forgot-password/index" />
      <Stack.Screen name="reset-password/index" />
      <Stack.Screen name="verify-otp/index" />
    </Stack>
  );
}
