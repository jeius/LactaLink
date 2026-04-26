import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import { useMyOrgScreeningForm } from '@/features/donor-screening/hooks/useMyOrgScreeningForm';
import { useScreenOptions } from '@/hooks/useScreenOptions';
import { Stack } from 'expo-router';

export default function DonorScreeningLayout() {
  const screenOptions = useScreenOptions();

  const { form, ...formQuery } = useMyOrgScreeningForm({ _status: 'published' });
  const { form: draftForm, ...draftFormQuery } = useMyOrgScreeningForm({ isDraft: true });

  const isLoading = formQuery.isLoading || draftFormQuery.isLoading;
  const hasForm = !!form;

  if (isLoading) return <LoadingSpinner />;

  return (
    <Stack
      initialRouteName={hasForm ? '(tabs)' : 'index'}
      screenOptions={{ ...screenOptions, presentation: 'containedModal' }}
    >
      <Stack.Protected guard={hasForm}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!!draftForm}>
        <Stack.Screen name="form/[id]" />
      </Stack.Protected>
    </Stack>
  );
}
