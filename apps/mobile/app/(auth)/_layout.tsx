import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="welcome/index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up/index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in/index" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password/index" options={{ headerShown: false }} />
    </Stack>
  );
}
