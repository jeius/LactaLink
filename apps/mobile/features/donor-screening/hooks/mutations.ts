import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  createCreateDraftScreeningFormMutationOpt,
  createDeleteScreeningFormMutationOpt,
  createNewSubmissionDraftMutationOption,
  createPublishScreeningFormMutationOpt,
  createPublishSubmissionMutationOptions,
  createSaveScreeningFormMutationOpt,
  createSaveSubmissionDraftMutationOptions,
  createSubmissionActionMutationOptions,
} from '../lib/mutationOptions';
import { useSubmissionFormQuery } from './queries';

// #region Submission Mutations

export function useCreateSubmissionDraftMutation() {
  const mutation = useMutation(createNewSubmissionDraftMutationOption());
  return mutation;
}

export function useSaveSubmissionDraftMutation(id: string | null | undefined) {
  const mutation = useMutation(createSaveSubmissionDraftMutationOptions(id));
  return mutation;
}

export function useSubmissionActionMutation(submissionID: string | null | undefined) {
  const mutation = useMutation(createSubmissionActionMutationOptions(submissionID));
  return mutation;
}
// #endregion

// #region Screening Form Mutations
export function usePublishSubmissionMutation(submissionID: string) {
  const { data } = useSubmissionFormQuery(submissionID);
  return useMutation(createPublishSubmissionMutationOptions(data));
}

export function useSaveScreeningFormMutation(formID: string | null | undefined) {
  const { mutateAsync, mutate, ...mutation } = useMutation(
    createSaveScreeningFormMutationOpt(formID)
  );

  const saveDraftAsync = useCallback(
    (data: DonorScreeningFormSchema) => {
      return mutateAsync({ data });
    },
    [mutateAsync]
  );

  const saveDraft = useCallback(
    (data: DonorScreeningFormSchema) => {
      mutate({ data });
    },
    [mutate]
  );

  return { ...mutation, mutateAsync: saveDraftAsync, mutate: saveDraft };
}

export function useCreateDraftScreeningFormMutation() {
  const { mutateAsync, ...mutation } = useMutation(createCreateDraftScreeningFormMutationOpt());

  const createAsync = useCallback(
    (templateID?: string) => {
      return mutateAsync({ templateID });
    },
    [mutateAsync]
  );

  return { ...mutation, mutateAsync: createAsync };
}

export function usePublishScreeningFormMutation(formID: string | null | undefined) {
  return useMutation(createPublishScreeningFormMutationOpt(formID));
}

export function useDeleteScreeningFormMutation(formID: string | null | undefined) {
  return useMutation(createDeleteScreeningFormMutationOpt(formID));
}
// #endregion
