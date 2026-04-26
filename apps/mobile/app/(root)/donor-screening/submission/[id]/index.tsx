import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import ScrollView from '@/components/ui/ScrollView';
import ScreeningOnboarding from '@/features/donor-screening/components/ScreeningOnboarding';
import { useSubmissionFormQuery } from '@/features/donor-screening/hooks/queries';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { ErrorSearchParams } from '@lactalink/types';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export default function DonorScreeningOnboarding() {
  const { id: submissionID } = useLocalSearchParams<{ id: string }>();
  const {
    data: submisson,
    isLoading,
    refetch,
    isRefetching,
    ...query
  } = useSubmissionFormQuery(submissionID);

  const [error, setError] = useState<unknown>(query.error);

  const form = extractCollection(submisson?.form);

  useEffect(() => {
    setError(query.error);
  }, [query.error]);

  useEffect(() => {
    if (submisson && !form) {
      setError({
        title: 'Form not found',
        message:
          'We could not find the screening form. It could be either deleted or does not exists',
      } satisfies ErrorSearchParams);
    }
  }, [form, submisson]);

  useErrorBoundary(error);

  if (isLoading || submisson === undefined || !form) {
    return <LoadingSpinner />;
  }

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <ScrollView refreshing={isRefetching} onRefresh={refetch}>
        <ScreeningOnboarding form={form} submission={submisson} />
      </ScrollView>
    </SafeArea>
  );
}
