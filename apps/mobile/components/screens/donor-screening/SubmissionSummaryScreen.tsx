import SafeArea from '@/components/SafeArea';
import ScrollView from '@/components/ui/ScrollView';
import SubmissionSummary from '@/features/donor-screening/components/SubmissionSummary';
import {
  useDraftSubmissionQuery,
  useStandardScreeningFormQuery,
} from '@/features/donor-screening/hooks/queries';

export default function SubmissionSummaryScreen() {
  const { data: form } = useStandardScreeningFormQuery();
  const { data: draft } = useDraftSubmissionQuery(form?.id);

  if (!form || !draft?.submissionData) return null;

  return (
    <SafeArea safeTop={false} className="items-stretch">
      <ScrollView contentContainerClassName="px-4 py-5">
        <SubmissionSummary form={form} data={draft.submissionData} />
      </ScrollView>
    </SafeArea>
  );
}
