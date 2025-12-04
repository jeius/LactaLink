import { getColor } from '@/lib/colors';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      initialRouteName="sign-in"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: getColor('background', '50') },
      }}
    />
  );
}
