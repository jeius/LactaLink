import { getApiClient } from '@lactalink/api';

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
