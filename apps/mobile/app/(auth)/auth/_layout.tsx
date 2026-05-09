import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const screenOptions = useScreenOptions();
  return <Stack screenOptions={screenOptions} />;
}
