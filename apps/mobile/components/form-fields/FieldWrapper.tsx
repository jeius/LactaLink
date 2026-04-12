import { AlertCircleIcon } from 'lucide-react-native';
import { FieldPath, FieldValues } from 'react-hook-form';
import { ViewProps } from 'react-native';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelAstrick,
  FormControlLabelText,
} from '../ui/form-control';
import { Icon } from '../ui/icon';
import { BaseFieldProps, FormFieldProps } from './types';

type BaseFieldTextProps = {
  text?: string | null;
  style?: ViewProps['style'];
  className?: ViewProps['className'];
};

export function FieldWrapper<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  children,
  error,
  helperText,
  label,
  contentPosition = 'middle',
  isRequired = false,
  labelClassName,
  labelStyle,
  helperTextClassName,
  helperTextStyle,
  errorTextClassName,
  errorTextStyle,
  labelIcon,
  labelIconPosition = 'start',
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <FormControl {...props} isInvalid={props.isInvalid ?? !!error}>
      <FieldLabel
        text={label}
        isRequired={isRequired}
        style={labelStyle}
        className={labelClassName}
        labelIcon={labelIcon}
        labelIconPosition={labelIconPosition}
      />

      {contentPosition === 'first' ? (
        <>
          {children}
          <FieldHelper text={helperText} style={helperTextStyle} className={helperTextClassName} />
          <FieldError text={error?.message} style={errorTextStyle} className={errorTextClassName} />
        </>
      ) : contentPosition === 'last' ? (
        <>
          <FieldHelper text={helperText} style={helperTextStyle} className={helperTextClassName} />
          <FieldError text={error?.message} style={errorTextStyle} className={errorTextClassName} />
          {children}
        </>
      ) : (
        <>
          <FieldError text={error?.message} style={errorTextStyle} className={errorTextClassName} />
          {children}
          <FieldHelper text={helperText} style={helperTextStyle} className={helperTextClassName} />
        </>
      )}
    </FormControl>
  );
}

export function FieldLabel({
  text,
  isRequired,
  labelIcon: icon,
  labelIconPosition: iconPosition = 'start',
  ...props
}: BaseFieldTextProps &
  Pick<BaseFieldProps, 'labelIcon' | 'labelIconPosition'> & {
    isRequired?: boolean;
  }) {
  if (!text) return null;
  return (
    <FormControlLabel {...props}>
      {icon && iconPosition === 'start' && <Icon as={icon} className="mr-2" />}
      <FormControlLabelText>
        {text} {isRequired && <FormControlLabelAstrick>*</FormControlLabelAstrick>}
      </FormControlLabelText>
      {icon && iconPosition === 'end' && <Icon as={icon} className="ml-2" />}
    </FormControlLabel>
  );
}

export function FieldError({ text, ...props }: BaseFieldTextProps) {
  if (!text) return null;
  return (
    <FormControlError {...props}>
      <FormControlErrorIcon as={AlertCircleIcon} />
      <FormControlErrorText>{text}</FormControlErrorText>
    </FormControlError>
  );
}

export function FieldHelper({ text, ...props }: BaseFieldTextProps) {
  if (!text) return null;
  return (
    <FormControlHelper {...props}>
      <FormControlHelperText>{text}</FormControlHelperText>
    </FormControlHelper>
  );
}
