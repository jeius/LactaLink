import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';

export default function DonorScreeningFormPagesLayout() {
  const screenOptions = useScreenOptions({ animationType: 'slide' });
  return <Stack screenOptions={screenOptions} />;
}
