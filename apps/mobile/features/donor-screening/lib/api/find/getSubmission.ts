import { getApiClient } from '@lactalink/api';
import { DonorScreeningSubmission } from '@lactalink/types/payload-generated-types';
import { Where } from '@lactalink/types/payload-types';

const DEPTH = 2;

export async function getSubmission(submissionID: string, init?: RequestInit) {
  return getApiClient().findByID(
    {
      collection: 'donor-screening-submissions',
      id: submissionID,
      depth: DEPTH,
    },
    init
  );
}

export async function getSubmissions(
  {
    formID,
    isDraft = false,
    _status = 'published',
    page,
    limit = 10,
  }: {
    formID?: string | null;
    isDraft?: boolean;
    _status?: DonorScreeningSubmission['_status'];
    page: number;
    limit?: number;
  },
  init?: RequestInit
) {
  const filters: Where[] = [{ _status: { equals: _status } }];
  if (formID) {
    filters.push({ form: { equals: formID } });
  }
  return getApiClient().find(
    {
      collection: 'donor-screening-submissions',
      where: { and: filters },
      draft: isDraft,
      limit,
      page,
      depth: DEPTH,
      pagination: true,
      sort: '-submittedAt',
    },
    init
  );
}

export async function getSubmissionsByUser(
  {
    page,
    limit = 10,
    userID,
  }: {
    userID: string;
    page: number;
    limit?: number;
  },
  init?: RequestInit
) {
  return getApiClient().find(
    {
      collection: 'donor-screening-submissions',
      where: { and: [{ submittedBy: { equals: userID } }, { _status: { equals: 'published' } }] },
      depth: DEPTH,
      sort: '-submittedAt',
      page,
      limit,
      pagination: true,
    },
    init
  );
}
