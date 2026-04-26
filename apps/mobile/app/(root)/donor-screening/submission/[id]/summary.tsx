import SafeArea from '@/components/SafeArea';
import ScrollView from '@/components/ui/ScrollView';
import SubmissionSummary from '@/features/donor-screening/components/SubmissionSummary';
import { useSubmissionFormQuery } from '@/features/donor-screening/hooks/queries';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useLocalSearchParams } from 'expo-router';

export default function ScreeningSubmissionSummary() {
  const { id: submissionID } = useLocalSearchParams<{ id: string }>();
  const { data: submisson } = useSubmissionFormQuery(submissionID);
  const form = extractCollection(submisson?.form);
  const submissionData = submisson?.submissionData;

  if (!form || !submissionData) return null;

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <ScrollView contentContainerClassName="px-4 py-5">
        <SubmissionSummary form={form} data={submissionData} />
      </ScrollView>
    </SafeArea>
  );
}
