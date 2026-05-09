import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';

export default function AuthEntryLayout() {
  const screenOptions = useScreenOptions();
  return <Stack initialRouteName="sign-in" screenOptions={screenOptions} />;
}
