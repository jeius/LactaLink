import { FieldWrapper } from '@/components/form-fields/FieldWrapper';
import { BaseFieldArrayProps } from '@/components/form-fields/types';
import { FieldPath, FieldValues, useFormState } from 'react-hook-form';

type ArrayFormControlProps<T extends FieldValues> = Omit<
  BaseFieldArrayProps<T>,
  'contentPosition' | 'isInvalid' | 'error'
>;

export default function ArrayFormControl<T extends FieldValues = FieldValues>({
  name,
  control,
  ...props
}: ArrayFormControlProps<T>) {
  const fieldName = name as FieldPath<T>;

  const { errors } = useFormState({ control });

  const error = errors?.[fieldName as keyof typeof errors]?.message;
  const errMsg = typeof error === 'string' ? error : 'Invalid value';

  return (
    <FieldWrapper
      {...props}
      contentPosition="last"
      error={{ message: errMsg }}
      isInvalid={!!error}
    />
  );
}
