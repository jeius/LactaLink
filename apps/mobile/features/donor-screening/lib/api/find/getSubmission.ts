import { getMeUser } from '@/lib/stores/meUserStore';
import { getApiClient } from '@lactalink/api';
import { DonorScreeningSubmission } from '@lactalink/types/payload-generated-types';
import { Where } from '@lactalink/types/payload-types';

export async function getSubmission(submissionID: string, init?: RequestInit) {
  return getApiClient().findByID(
    {
      collection: 'donor-screening-submissions',
      id: submissionID,
      depth: 2,
    },
    init
  );
}

export async function getSubmittedStandardForm(
  {
    formID,
    status = 'published',
  }: { formID: string; status?: NonNullable<DonorScreeningSubmission['_status']> },
  init?: RequestInit
) {
  const filters: Where[] = [{ form: { equals: formID } }, { _status: { equals: status } }];

  // Its okay if this filter is optional since the API already has access control in place
  // Users will only be able to see their own drafts
  const user = getMeUser();
  if (user) {
    filters.push({ submittedBy: { equals: user.id } });
  }

  const submissions = await getApiClient().find(
    {
      collection: 'donor-screening-submissions',
      draft: status === 'draft',
      where: { and: filters },
      limit: 1,
      pagination: false,
      depth: 1,
    },
    init
  );

  return submissions[0] || null;
}

export async function getMyDraftSubmissionForm(formID: string, init?: RequestInit) {
  const filters: Where[] = [{ form: { equals: formID } }];

  // Its okay if this filter is optional since the API already has access control in place
  // Users will only be able to see their own drafts
  const user = getMeUser();
  if (user) {
    filters.push({ submittedBy: { equals: user.id } });
  }

  const submissions = await getApiClient().find(
    {
      collection: 'donor-screening-submissions',
      draft: true,
      where: { and: filters },
      limit: 1,
      pagination: false,
      depth: 1,
    },
    init
  );

  return submissions[0] || null;
}
