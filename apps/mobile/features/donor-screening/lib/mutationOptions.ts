import { QUERY_KEYS } from '@/lib/constants';
import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { DonorScreeningSubmission } from '@lactalink/types/payload-generated-types';
import { mutationOptions } from '@tanstack/react-query';
import {
  createDraftScreeningForm,
  deleteScreeningForm,
  publishScreeningForm,
  saveScreeningForm,
} from './api/mutate/screeningForm';
import {
  actOnSubmission,
  createSubmissionDraft,
  publishSubmission,
  saveSubmissionDraft,
} from './api/mutate/submission';
import { addScreeningFormToDraftCache, addSubmissionToCache } from './cacheUtils';

// #region Submission Mutations
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

export function createNewSubmissionDraftMutationOption() {
  return mutationOptions({
    mutationKey: ['donor-screening-submissions', 'create-draft'],
    mutationFn: async ({ formID }: { formID: string }) => {
      return createSubmissionDraft({ formID });
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      if (data) addSubmissionToCache(client, data);
    },
  });
}

export function createSaveSubmissionDraftMutationOptions(id: string | null | undefined) {
  return mutationOptions({
    mutationKey: ['donor-screening-submissions', 'save-draft', id].filter(Boolean),
    mutationFn: async ({ data }: { data: Record<string, unknown> }) => {
      if (!id) return null;
      return saveSubmissionDraft({ submissionID: id, submissionData: data });
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      if (data) addSubmissionToCache(client, data);
    },
  });
}

export function createSubmissionActionMutationOptions(submissionID: string | null | undefined) {
  return mutationOptions({
    mutationKey: ['donor-screening-submissions', 'action', submissionID].filter(Boolean),
    mutationFn: async ({ action }: { action: 'approve' | 'reject' }) => {
      if (!submissionID) return null;
      return actOnSubmission({ submissionID, action });
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey: [QUERY_KEYS.SCREENING_FORM_SUBMISSIONS.ALL] });
    },
  });
}
// #endregion

// #region Screening Form Mutations
export function createSaveScreeningFormMutationOpt(formID: string | null | undefined) {
  return mutationOptions({
    mutationKey: ['donor-screening-forms', 'save', formID].filter(Boolean),
    mutationFn: async ({ data }: { data: DonorScreeningFormSchema }) => {
      return saveScreeningForm(data, formID || undefined);
    },
    onSuccess: async (data, _vars, _ctx, { client }) => {
      if (!data) return;
      addScreeningFormToDraftCache(client, data);
    },
  });
}

export function createCreateDraftScreeningFormMutationOpt() {
  return mutationOptions({
    mutationKey: ['donor-screening-forms', 'create-draft'].filter(Boolean),
    mutationFn: async ({ templateID }: { templateID?: string }) => {
      return createDraftScreeningForm(templateID);
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.SCREENING_FORMS.ALL });
    },
  });
}

export function createPublishScreeningFormMutationOpt(formID: string | null | undefined) {
  return mutationOptions({
    mutationKey: ['donor-screening-forms', 'publish', formID].filter(Boolean),
    mutationFn: async () => {
      if (!formID) return null;
      return publishScreeningForm(formID);
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.SCREENING_FORMS.ALL });
    },
  });
}

export function createDeleteScreeningFormMutationOpt(formID: string | null | undefined) {
  return mutationOptions({
    mutationKey: ['donor-screening-forms', 'delete', formID],
    mutationFn: async () => {
      if (!formID) return null;
      return deleteScreeningForm(formID);
    },
    onSuccess: async (_data, _vars, _ctx, { client }) => {
      await client.invalidateQueries({ queryKey: QUERY_KEYS.SCREENING_FORMS.ALL });
    },
  });
}
// #endregion
