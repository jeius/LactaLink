import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';

export default function ProfileRootLayout() {
  const screenOptions = useScreenOptions();

  return (
    <Stack initialRouteName="index" screenOptions={screenOptions}>
      <Stack.Screen
        name="[slug]/[id]/edit"
        options={{ ...screenOptions, presentation: 'card', animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
