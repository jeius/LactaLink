import { FormProps, useForm } from '@/components/contexts/FormProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { DonorScreeningFormField } from '@lactalink/types/collections';
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

export function useScreeningFormRootFields(): {
  formMethods: Omit<FormProps, 'children'> & { submit: () => boolean | Promise<boolean> };
  fields: DonorScreeningFormField[] | undefined;
  title: string | undefined;
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

  const rootFields = useMemo(
    () => (form?.fields as DonorScreeningFormField[] | undefined) ?? undefined,

    [form?.fields]
  );

  const resolver = useMemo(
    () => (rootFields ? zodResolver(buildZodSchema(rootFields)) : undefined),
    [rootFields]
  );

  const defaultValues = useMemo(
    () => (rootFields ? createDefaultValues(rootFields, parentFormValues) : undefined),
    [parentFormValues, rootFields]
  );

  const methods = useHookForm({ resolver, defaultValues });
  const { reset, handleSubmit, control } = methods;

  /**
   * Snapshot of the last values pushed to the parent form by this section.
   * Used to distinguish own changes from external ones in the Parent→Section effect.
   */
  const lastPushedToParent = useRef<Record<string, unknown>>({});

  /** Tracks the previous rootFields reference to detect section navigation. */
  const prevRootFieldsRef = useRef<typeof rootFields>(undefined);

  const rootValues = useWatch<Record<string, unknown>>({ control });

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
    if (!rootFields) return;

    const pushToParent = debounce(() => {
      const pushed: Record<string, unknown> = {};
      rootFields.forEach((field) => {
        if (field.blockType === 'message' || !field.name) return;
        const value = rootValues[field.name];
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
  }, [rootValues, rootFields, setParentValue]);

  // Parent → Section: when the parent form receives new values (e.g. from a draft), push them down.
  // Always resets on section navigation; skips reset when the change originated from this section.
  useEffect(() => {
    const sectionFieldsChanged = prevRootFieldsRef.current !== rootFields;
    prevRootFieldsRef.current = rootFields;

    if (!rootFields) return;

    const resetFromParent = debounce(() => {
      if (!sectionFieldsChanged) {
        // Values of this section from the parent form.
        const parentSectionValuesObj = Object.fromEntries(
          rootFields
            .filter((f) => f.blockType !== 'message' && 'name' in f)
            .map((f) => [f.name, parentFormValues[f.name]] as const)
        );

        // Skip if the current parent values match what this section last pushed.
        if (isEqual(lastPushedToParent.current, parentSectionValuesObj)) return;
      }

      // Section changed or external data update: clear the snapshot and reset.
      lastPushedToParent.current = {};
      const newValues = createDefaultValues(rootFields, parentFormValues);
      if (newValues) reset(newValues);
    }, 800);

    resetFromParent();
    return () => resetFromParent.cancel();
  }, [parentFormValues, reset, rootFields]);

  return {
    formMethods: { ...methods, ...queryState, submit: submitHandler },
    fields: rootFields,
    title: form?.title,
  };
}
