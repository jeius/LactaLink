import { useAuth } from '@/hooks/auth/useAuth';
import { useScreenFormSheetOptions, useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';

export default function Layout() {
  const { profile } = useAuth();
  const screenOptions = useScreenOptions();
  const formSheetOptions = useScreenFormSheetOptions();

  const hasProfile = Boolean(profile);

  return (
    <Stack
      initialRouteName={hasProfile ? '(drawer)' : '(profile-setup)/profile/setup'}
      screenOptions={screenOptions}
    >
      <Stack.Protected guard={!hasProfile}>
        <Stack.Screen name="(profile-setup)/profile/setup" />
      </Stack.Protected>

      <Stack.Screen name="posts/[id]/comments" options={formSheetOptions} />

      <Stack.Screen
        name="(create)/delivery-preferences/create"
        options={{ headerShown: true, title: 'New Delivery Preference' }}
      />

      <Stack.Screen
        name="(create)/feed/create"
        options={{ headerShown: true, title: 'Create Post' }}
      />

      <Stack.Screen name="(create)/conversations/create" />
    </Stack>
  );
}
