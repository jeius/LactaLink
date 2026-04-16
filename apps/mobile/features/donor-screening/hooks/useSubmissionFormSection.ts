import { FormProps, useForm } from '@/components/contexts/FormProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { DonorScreeningFormSection } from '@lactalink/types/collections';
import {
  DonorScreeningForm,
  DonorScreeningSubmission,
} from '@lactalink/types/payload-generated-types';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { SubmitHandler, useForm as useHookForm, useWatch } from 'react-hook-form';
import { buildZodSchema } from '../lib/buildZodSchema';
import { createDefaultValues } from '../lib/createDefaultValues';

export function useSubmissionFormSection({
  sectionID,
}: {
  sectionID?: string | null;
}): Partial<DonorScreeningFormSection> & {
  formMethods: Omit<FormProps, 'children'> & { submit: () => Promise<boolean> | boolean };
} {
  const {
    control: parentFormControl,
    additionalState: { extraData, ...queryState },
    setValue: setParentValue,
  } = useForm();

  const parentFormValues = useWatch({ control: parentFormControl });

  const { form } = (extraData || {}) as {
    form?: DonorScreeningForm | null;
    draftSubmission?: DonorScreeningSubmission | null;
  };

  const section = sectionID ? form?.sections?.find((s) => s.id === sectionID) : form?.sections?.[0];
  const sectionFields = section?.fields;

  const resolver = useMemo(
    () => (sectionFields ? zodResolver(buildZodSchema(sectionFields)) : undefined),
    [sectionFields]
  );

  const defaultValues = useMemo(
    () => (sectionFields ? createDefaultValues(sectionFields, parentFormValues) : undefined),
    [parentFormValues, sectionFields]
  );

  const methods = useHookForm({ resolver, defaultValues });
  const { reset, handleSubmit, control } = methods;

  /**
   * Snapshot of the last values pushed to the parent form by this section.
   * Used to distinguish own changes from external ones in the Parent→Section effect.
   */
  const lastPushedToParent = useRef<Record<string, unknown>>({});

  /** Tracks the previous sectionFields reference to detect section navigation. */
  const prevSectionFieldsRef = useRef<typeof sectionFields>(undefined);

  const sectionValues = useWatch<Record<string, unknown>>({ control });

  const submitHandler = useCallback(async () => {
    let isValid = false;
    const onSubmit: SubmitHandler<Record<string, unknown>> = (values) => {
      reset(values);
      isValid = true;
    };
    await handleSubmit(onSubmit)();
    return isValid;
  }, [handleSubmit, reset]);

  // Section → Parent: propagate section field changes to the parent form and mark it dirty.
  useEffect(() => {
    if (!sectionFields) return;

    const pushToParent = debounce(() => {
      const pushed: Record<string, unknown> = {};
      sectionFields.forEach((field) => {
        if (field.blockType === 'message' || !field.name) return;
        const value = sectionValues[field.name];
        if (value !== undefined) {
          pushed[field.name] = value;
          setParentValue(field.name, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
      });
      lastPushedToParent.current = pushed;
    }, 800);

    pushToParent();
    return () => pushToParent.cancel();
  }, [sectionValues, sectionFields, setParentValue]);

  // Parent → Section: when the parent form receives new values (e.g. from a draft), push them down.
  // Always resets on section navigation; skips reset when the change originated from this section.
  useEffect(() => {
    const sectionFieldsChanged = prevSectionFieldsRef.current !== sectionFields;
    prevSectionFieldsRef.current = sectionFields;

    if (!sectionFields) return;

    const resetFromParent = debounce(() => {
      if (!sectionFieldsChanged) {
        // Values of this section from the parent form.
        const parentSectionValuesObj = Object.fromEntries(
          sectionFields
            .filter((f) => f.blockType !== 'message' && 'name' in f)
            .map((f) => [f.name, parentFormValues[f.name]] as const)
        );

        // Skip if the current parent values match what this section last pushed.
        if (isEqual(lastPushedToParent.current, parentSectionValuesObj)) return;
      }

      // Section changed or external data update: clear the snapshot and reset.
      lastPushedToParent.current = {};
      const newValues = createDefaultValues(sectionFields, parentFormValues);
      if (newValues) reset(newValues);
    }, 800);

    resetFromParent();
    return () => resetFromParent.cancel();
  }, [parentFormValues, reset, sectionFields]);

  return {
    formMethods: { ...methods, ...queryState, submit: submitHandler },
    ...(section ?? {}),
  };
}
