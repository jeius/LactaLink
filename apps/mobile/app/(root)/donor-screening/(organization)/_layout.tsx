import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { useMyOrgScreeningForm } from '@/features/donor-screening/hooks/useMyOrgScreeningForm';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';

export default function DonorScreeningLayout() {
  const screenOptions = useScreenOptions();

  const { form, isLoading } = useMyOrgScreeningForm();
  const hasForm = !!form;

  if (isLoading) return <LoadingSpinner />;

  return (
    <Stack initialRouteName={hasForm ? '(tabs)' : 'index'} screenOptions={screenOptions}>
      <Stack.Protected guard={hasForm}>
        <Stack.Screen name="(tabs)" options={{ headerShown: true, headerTitle: 'Overview' }} />
      </Stack.Protected>
    </Stack>
  );
}
