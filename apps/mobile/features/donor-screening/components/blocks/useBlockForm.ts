import { zodResolver } from '@hookform/resolvers/zod';
import { DonorScreeningFormField } from '@lactalink/types/collections';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { useEffect, useRef } from 'react';
import {
  Control,
  DefaultValues,
  FieldPath,
  useController,
  useForm,
  useFormState,
} from 'react-hook-form';
import { z } from 'zod';

type FieldSchema = Exclude<DonorScreeningFormField, { blockType: 'message' }>;

type Params<
  TFieldValues extends FieldSchema = FieldSchema,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  control: Control<TFieldValues> | undefined;
  schema: z.ZodType<TFieldValues, TFieldValues>;
  defaultValues?: DefaultValues<Omit<TFieldValues, 'name'>>;
};

export function useBlockForm<TFieldValues extends FieldSchema = FieldSchema>({
  name,
  control,
  schema,
  defaultValues,
}: Params<TFieldValues>) {
  const {
    field: { value, onChange, onBlur },
    fieldState,
    formState,
  } = useController({ control, name });

  const lastPushedValueRef = useRef({});

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name,
      label: '',
      width: 'full',
      ...defaultValues,
    } as DefaultValues<TFieldValues>,
  });

  const { reset, getValues } = methods;

  // Re-renders only when isDirty changes (false→true, true→false), not on every keystroke.
  const { isDirty } = useFormState({ control: methods.control });

  // Sync: This Form -> Parent
  // Triggered when the sub-form becomes dirty. Captures the latest values via getValues(),
  // pushes them to the parent, then resets to clear isDirty so subsequent changes are detected.
  useEffect(() => {
    if (!isDirty) return;

    const pushToParent = debounce(() => {
      const currentValues = getValues();
      onChange(currentValues);
      onBlur();
      lastPushedValueRef.current = currentValues;
      reset(currentValues as DefaultValues<TFieldValues>);
    }, 800);

    pushToParent();
    return () => pushToParent.cancel();
  }, [isDirty, getValues, onChange, onBlur, reset]);

  // Sync: Parent -> This Form
  // Triggered when the parent form updates this field externally (e.g. a form-wide reset with
  // new server data). Skips the reset if the change originated from this form's own push above.
  useEffect(() => {
    const resetFromParent = debounce(() => {
      if (!value) return;
      if (isEqual(lastPushedValueRef.current, value)) return;
      // External value update: clear the snapshot and reset.
      lastPushedValueRef.current = {};
      reset(value as DefaultValues<TFieldValues>);
    }, 800);

    resetFromParent();
    return () => resetFromParent.cancel();
  }, [value, reset]);

  return { methods, fieldState, formState };
}
