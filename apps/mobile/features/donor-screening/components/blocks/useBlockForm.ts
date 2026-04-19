import { zodResolver } from '@hookform/resolvers/zod';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useRef } from 'react';
import { DefaultValues, useForm, useFormState } from 'react-hook-form';
import { type ZodType } from 'zod';
import { BaseBlockProps, BlockSchema } from '../../lib/types';

type Params<TFieldValues extends BlockSchema = BlockSchema> = BaseBlockProps<TFieldValues> & {
  schema: ZodType<TFieldValues, TFieldValues>;
};

export function useBlockForm<TFieldValues extends BlockSchema = BlockSchema>({
  name,
  schema,
  defaultValues,
  values,
  onSubmit,
  onFormStateChange,
}: Params<TFieldValues>) {
  const lastPushedValueRef = useRef({});

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name,
      width: 'full',
      ...defaultValues,
    } as DefaultValues<TFieldValues>,
  });

  const { reset, handleSubmit } = methods;

  const formState = useFormState({ control: methods.control });

  const submit = useCallback(() => {
    handleSubmit(async (data) => {
      lastPushedValueRef.current = data;
      reset(data);
      await onSubmit?.(data);
    })();
  }, [handleSubmit, onSubmit, reset]);

  const handleReset = useCallback(() => reset(), [reset]);

  // Sync: Parent -> This Form
  // Triggered when the parent form updates this field externally (e.g. a form-wide reset with
  // new server data). Skips the reset if the change originated from this form's own push above.
  useEffect(() => {
    const resetFromParent = debounce(() => {
      if (!values) return;
      if (isEqual(lastPushedValueRef.current, values)) return;
      // External value update: clear the snapshot and reset.
      lastPushedValueRef.current = {};
      reset(values);
    }, 800);

    resetFromParent();
    return () => resetFromParent.cancel();
  }, [values, reset]);

  // Notify parent of form state changes (e.g. dirty) for external UI updates like enabling a "Save" button.
  useEffect(() => {
    onFormStateChange?.(formState);
  }, [formState, onFormStateChange]);

  return { methods: { ...methods, submit, reset: handleReset } };
}
