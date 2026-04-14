import { useMutation } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { useCallback, useMemo } from 'react';
import {
  createPublishSubmissionMutationOptions,
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
