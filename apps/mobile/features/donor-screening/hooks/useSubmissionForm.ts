import { FormProps } from '@/components/contexts/FormProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';
import { DonorScreeningSubmissionData } from '@lactalink/utilities';
import { extractCollection } from '@lactalink/utilities/extractors';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { buildInitialFormState } from '../lib/buildFormState';
import { buildZodSchema } from '../lib/buildZodSchema';
import { useSubmissionFormQuery } from './queries';

export function useSubmissionForm(id: string): Omit<FormProps, 'children'> {
  const { data: submission, ...submissionQuery } = useSubmissionFormQuery(id);

  const form = extractCollection(submission?.form);
  const isLoading = submissionQuery.isLoading;
  const isFetching = submissionQuery.isFetching;
  const fetchError = submissionQuery.error;
  const refreshing = submissionQuery.isRefetching;
  const refresh = submissionQuery.refetch;

  const resolver = useMemo(() => (form ? zodResolver(buildSchema(form)) : undefined), [form]);

  const defaultValues = useMemo(() => (form ? buildInitialState(form) : undefined), [form]);

  const methods = useForm({ resolver, defaultValues });
  const { reset } = methods;

  useEffect(() => {
    if (submission?.submissionData) {
      reset(DonorScreeningSubmissionData.parse(submission.submissionData));
    }
  }, [submission, reset]);

  return {
    ...methods,
    isLoading,
    isFetching,
    fetchError,
    refreshing,
    onRefresh: refresh,
    extraData: { form, draftSubmission: submission },
  };
}

// #region Helpers
function buildSchema(form: DonorScreeningForm) {
  const { fields, sections } = form;

  const defaultFieldShape = z.object({});
  const fieldShape = fields ? buildZodSchema(fields) : defaultFieldShape;

  const sectionShape = sections
    ? sections.reduce((schema, section) => {
        if (section.fields) {
          return z.object({ ...schema.shape, ...buildZodSchema(section.fields).shape });
        }
        return schema;
      }, defaultFieldShape)
    : defaultFieldShape;

  return z.object({ ...fieldShape.shape, ...sectionShape.shape });
}

export function buildInitialState(form: DonorScreeningForm) {
  const { fields, sections } = form;

  const fieldState = fields ? buildInitialFormState(fields) : {};

  const sectionState = sections
    ? sections.reduce((acc, section) => {
        if (section.fields) {
          return { ...acc, ...buildInitialFormState(section.fields) };
        }
        return acc;
      }, {})
    : {};

  return { ...fieldState, ...sectionState };
}
// #endregion
