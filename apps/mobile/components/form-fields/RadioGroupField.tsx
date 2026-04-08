import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { CircleIcon } from 'lucide-react-native';
import { FieldPath, FieldValues, useController } from 'react-hook-form';
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '../ui/radio';
import { FieldWrapper } from './FieldWrapper';
import { BaseFieldProps } from './types';

const radioGroupStyles = tva({
  base: '',
  variants: {
    orientation: {
      horizontal: 'flex-row flex-wrap items-center gap-4',
      vertical: 'flex-col items-start gap-2',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

interface RadioGroupFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
> extends Omit<BaseFieldProps<TFieldValues, TName>, 'error'> {
  options: TItem[];
  transformOption: (optionItem: TItem) => {
    value: string;
    label: string;
  };
  radioGroupProps?: {
    orientation?: 'horizontal' | 'vertical';
    className?: string;
  };
}

export default function RadioGroupField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TItem = unknown,
>({
  control,
  name,
  isDisabled,
  isLoading,
  options: items,
  transformOption: transformItem,
  contentPosition = 'first',
  radioGroupProps: { orientation = 'horizontal', ...radioGroupProps } = {},
  ...props
}: RadioGroupFieldProps<TFieldValues, TName, TItem>) {
  const {
    field: { ref, value, onChange, disabled, onBlur },
    fieldState: { error, invalid },
    formState: { isSubmitting },
  } = useController({ name, control });

  const disabledState = isDisabled || disabled || isSubmitting || isLoading;

  return (
    <FieldWrapper
      {...props}
      contentPosition={contentPosition}
      isInvalid={invalid}
      error={error}
      isDisabled={disabledState}
    >
      <RadioGroup
        {...radioGroupProps}
        ref={ref}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        isDisabled={disabledState}
        className={radioGroupStyles({ className: radioGroupProps.className, orientation })}
      >
        {items.map((item, idx) => {
          const { value: itemValue, label } = transformItem(item);
          return (
            <Radio key={`${itemValue}-${idx}`} value={itemValue}>
              <RadioIndicator>
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
              <RadioLabel>{label}</RadioLabel>
            </Radio>
          );
        })}
      </RadioGroup>
    </FieldWrapper>
  );
}
