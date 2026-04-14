import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import { DonorScreeningSubmissionData } from '@lactalink/utilities';
import { getSubmittedStandardForm } from '../find/getSubmission';

export async function saveSubmission(
  { data, formID }: { formID: string; data: Record<string, unknown> },
  init?: RequestInit
) {
  const apiClient = getApiClient();
  const depth = 2;

  const [existingDraft, { fields, sections }] = await Promise.all([
    getSubmittedStandardForm({ formID, status: 'draft' }, init),
    apiClient.findByID(
      {
        collection: 'donor-screening-forms',
        id: formID,
        depth: depth,
        select: { fields: true, sections: true },
      },
      init
    ),
  ]);

  const sectionFields = sections?.flatMap((section) => section.fields) || [];
  const allFields = [...(fields || []), ...sectionFields].filter(
    Boolean
  ) as DonorScreeningFormField[];

  if (existingDraft) {
    const existingSubmissionData = existingDraft.submissionData
      ? DonorScreeningSubmissionData.parse(existingDraft.submissionData)
      : {};

    const mergedData = { ...existingSubmissionData, ...data };

    return apiClient.updateByID(
      {
        collection: 'donor-screening-submissions',
        id: existingDraft.id,
        autoSave: true,
        draft: true,
        depth: depth,
        data: { submissionData: DonorScreeningSubmissionData.transform(mergedData, allFields) },
      },
      init
    );
  }

  return apiClient.create(
    {
      collection: 'donor-screening-submissions',
      draft: true,
      depth: depth,
      data: {
        form: formID,
        submissionData: DonorScreeningSubmissionData.transform(data, allFields),
        submittedBy: getMeUser()?.id!, // The user is logged in at this point
        submittedAt: undefined!, // This is a draft submission, so we don't set submittedAt yet
      },
    },
    init
  );
}
