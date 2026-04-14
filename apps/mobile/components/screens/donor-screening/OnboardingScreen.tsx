import LoadingSpinner from '@/components/loaders/LoadingSpinner';
import SafeArea from '@/components/SafeArea';
import ScrollView from '@/components/ui/ScrollView';
import ScreeningOnboarding from '@/features/donor-screening/components/ScreeningOnboarding';
import { useStandardScreeningFormQuery } from '@/features/donor-screening/hooks/queries';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import { Stack } from 'expo-router';

export default function OnboardingScreen() {
  const {
    data: standardForm,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useStandardScreeningFormQuery();

  useErrorBoundary(error);

  if (isLoading || !standardForm) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Donor Screening' }} />
      <SafeArea safeTop={false} className="items-stretch">
        <ScrollView refreshing={isRefetching} onRefresh={refetch}>
          <ScreeningOnboarding form={standardForm} />
        </ScrollView>
      </SafeArea>
    </>
  );
}
