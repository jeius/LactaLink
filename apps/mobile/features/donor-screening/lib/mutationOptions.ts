import { DonorScreeningSubmission } from '@lactalink/types/payload-generated-types';
import { mutationOptions } from '@tanstack/react-query';
import { publishSubmission } from './api/mutate/publishSubmission';
import { saveSubmission } from './api/mutate/saveSubmission';
import { addDraftSubmissionToCache, addSubmissionToCache } from './cacheUtils';

export function createSaveSubmissionMutationOptions(formID: string, init?: RequestInit) {
  return mutationOptions({
    mutationKey: ['donor-screening-submissions', 'save', formID],
    mutationFn: async ({ data }: { data: Record<string, unknown> }) => {
      return saveSubmission({ formID, data }, init);
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      if (data) addDraftSubmissionToCache(client, data);
    },
  });
}

export function createPublishSubmissionMutationOptions(
  submission: DonorScreeningSubmission | undefined | null,
  init?: RequestInit
) {
  return mutationOptions({
    mutationKey: ['donor-screening-submissions', 'publish', submission?.id].filter(Boolean),
    mutationFn: async () => {
      const submissionID = submission?.id;
      if (!submissionID) return null;
      return publishSubmission(submissionID, init);
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      if (data) addSubmissionToCache(client, data);
    },
  });
}
