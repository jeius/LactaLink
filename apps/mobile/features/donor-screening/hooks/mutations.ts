import { DonorScreeningFormSchema } from '@lactalink/form-schemas';
import { useMutation } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useCallback, useMemo } from 'react';
import {
  createCreateDraftScreeningFormMutationOpt,
  createDeleteScreeningFormMutationOpt,
  createPublishScreeningFormMutationOpt,
  createPublishSubmissionMutationOptions,
  createSaveScreeningFormMutationOpt,
  createSaveSubmissionMutationOptions,
} from '../lib/mutationOptions';
import { useDraftSubmissionQuery } from './queries';

export function useSaveDraftSubmissionMutation(
  formID: string,
  formValues: Record<string, unknown> = {}
) {
  const mutation = useMutation(createSaveSubmissionMutationOptions(formID));
  const { mutateAsync } = mutation;

  const saveDraft = useCallback(
    (data: Record<string, unknown>) => {
      const combinedData = { ...formValues, ...data };
      return mutateAsync({ data: combinedData });
    },
    [formValues, mutateAsync]
  );

  const debouncedSaveDraft = useMemo(
    () => debounce(saveDraft, 3000, { trailing: true }),
    [saveDraft]
  );

  return { ...mutation, debouncedSaveDraft, mutateAsync: saveDraft };
}

export function usePublishSubmissionMutation(formID: string | null | undefined) {
  const { data } = useDraftSubmissionQuery(formID);
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
