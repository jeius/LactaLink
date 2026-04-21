import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import ScrollView from '@/components/ui/ScrollView';
import ScreeningPreview from '@/features/donor-screening/components/ScreeningPreview';
import { useMyOrgScreeningForm } from '@/features/donor-screening/hooks/useMyOrgScreeningForm';

export default function FormTab() {
  const { form, isLoading, isRefetching, refetch } = useMyOrgScreeningForm();

  if (isLoading || !form) return <LoadingSpinner />;

  return (
    <ScrollView refreshing={isRefetching} onRefresh={refetch} contentContainerClassName="p-4">
      <ScreeningPreview form={form} />
    </ScrollView>
  );
}
