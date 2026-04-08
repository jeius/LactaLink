import { CheckIcon } from 'lucide-react-native';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxProps,
} from '../ui/checkbox';
import { Skeleton } from '../ui/skeleton';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

export interface CheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  checkboxProps?: Pick<CheckboxProps, 'size' | 'className' | 'style'>;
}

export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  isDisabled,
  isLoading,
  label,
  labelClassName,
  checkboxProps: { size = 'md', ...checkboxProps } = {},
  contentPosition = 'first',
  ...props
}: CheckboxFieldProps<TFieldValues, TName>) {
  const {
    field: { disabled, ...field },
    fieldState: { error, invalid },
    formState: { isSubmitting },
  } = useController({ name, control });

  const disabledState = isDisabled || disabled || isSubmitting;

  return (
    <FieldWrapper
      {...props}
      label={null}
      contentPosition={contentPosition}
      isInvalid={invalid}
      error={error}
      isDisabled={disabledState}
    >
      {isLoading ? (
        <Skeleton variant="rounded" className="h-10" />
      ) : (
        <Checkbox
          {...checkboxProps}
          {...field}
          value={`checkbox-${name}`}
          isChecked={!!field.value}
          isDisabled={disabledState}
          isInvalid={invalid}
          size={size}
        >
          <CheckboxIndicator>
            <CheckboxIcon as={CheckIcon} />
          </CheckboxIndicator>
          {label && <CheckboxLabel className={labelClassName}>{label}</CheckboxLabel>}
        </Checkbox>
      )}
    </FieldWrapper>
  );
}
