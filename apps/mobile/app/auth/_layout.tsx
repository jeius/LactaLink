import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Stack } from 'expo-router';

export default function Layout() {
  const { themeColors } = useTheme();
  const bgColor = themeColors.background[50];
  return (
    <Stack
      initialRouteName="sign-in"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bgColor } }}
    />
  );
}
