import { useScreenFormSheetOptions, useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';

export default function ProfileRootLayout() {
  const screenOptions = useScreenOptions();
  const formSheetOptions = useScreenFormSheetOptions();

  return (
    <Stack initialRouteName="index" screenOptions={screenOptions}>
      <Stack.Screen name="[slug]/[id]/edit" options={formSheetOptions} />
    </Stack>
  );
}
