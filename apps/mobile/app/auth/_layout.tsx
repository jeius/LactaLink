import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { getHexColor } from '@/lib/colors';
import { Stack } from 'expo-router';

export default function Layout() {
  const { theme } = useTheme();
  const bgColor = getHexColor(theme, 'background', 50);
  return (
    <Stack
      initialRouteName="sign-in"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bgColor } }}
    />
  );
}
