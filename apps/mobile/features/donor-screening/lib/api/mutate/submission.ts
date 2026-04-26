import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import { DonorScreeningSubmissionData } from '@lactalink/utilities';
import { extractCollection } from '@lactalink/utilities/extractors';
import { getSubmission } from '../find/getSubmission';

export async function createSubmissionDraft(params: { formID: string }, init?: RequestInit) {
  const { formID } = params;

  const user = getMeUser();

  if (!user) {
    throw new Error('User must be logged in to create a submission draft');
  }

  const existingSubmission = await getExistingSubmission({ formID, submittedBy: user.id }, init);

  if (existingSubmission) {
    return existingSubmission;
  }

  return getApiClient().create(
    {
      collection: 'donor-screening-submissions',
      draft: true,
      data: { form: formID, submittedBy: user.id, submittedAt: undefined!, submissionData: [] },
      depth: 2,
    },
    init
  );
}

export async function saveSubmissionDraft(
  params: { submissionID: string; submissionData: Record<string, unknown> },
  init?: RequestInit
) {
  const { submissionID, submissionData } = params;
  const apiClient = getApiClient();
  const depth = 2;

  const submission = await getSubmission(submissionID, init);
  const form = extractCollection(submission.form);

  const sectionFields = form?.sections?.flatMap((section) => section.fields) || [];
  const allFields = [...(form?.fields || []), ...sectionFields].filter(
    Boolean
  ) as DonorScreeningFormField[];

  const prevSubmissionData = submission.submissionData
    ? DonorScreeningSubmissionData.parse(submission.submissionData)
    : {};

  const mergedData = { ...prevSubmissionData, ...submissionData };

  return apiClient.updateByID(
    {
      collection: 'donor-screening-submissions',
      id: submissionID,
      autoSave: true,
      draft: true,
      depth: depth,
      data: { submissionData: DonorScreeningSubmissionData.transform(mergedData, allFields) },
    },
    init
  );
}

export function publishSubmission(submissionID: string, init?: RequestInit) {
  return getApiClient().updateByID(
    {
      collection: 'donor-screening-submissions',
      id: submissionID,
      data: { _status: 'published', submittedAt: new Date().toISOString() },
      depth: 2,
    },
    init
  );
}

export function actOnSubmission(
  { submissionID, action }: { submissionID: string; action: 'approve' | 'reject' },
  init?: RequestInit
) {
  return getApiClient().updateByID(
    {
      collection: 'donor-screening-submissions',
      id: submissionID,
      data: {
        isApproved: action === 'approve' ? true : undefined,
        isRejected: action === 'reject' ? true : undefined,
        approvedAt: action === 'approve' ? new Date().toISOString() : undefined,
        rejectedAt: action === 'reject' ? new Date().toISOString() : undefined,
        approvedBy: action === 'approve' ? getMeUser()?.id : undefined,
        rejectedBy: action === 'reject' ? getMeUser()?.id : undefined,
      },
    },
    init
  );
}

// #region Helpers

async function getExistingSubmission(
  { formID, submittedBy }: { formID: string; submittedBy: string },
  init?: RequestInit
) {
  const submissions = await getApiClient().find(
    {
      collection: 'donor-screening-submissions',
      draft: true,
      where: {
        and: [{ form: { equals: formID } }, { submittedBy: { equals: submittedBy } }],
      },
      limit: 1,
      pagination: false,
      depth: 2,
    },
    init
  );

  return submissions[0] || null;
}
// #endregion
