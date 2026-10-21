import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputProps } from '@/components/ui/input';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DatePickerOptions } from '@react-native-community/datetimepicker';
import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { FC } from 'react';
import { Icon } from './ui/icon';

const inputStyle = tva({ base: 'items-stretch' });

export type DatePickerInputProps = InputProps & {
  mode?: 'date' | 'datetime' | 'time' | 'countdown';
  showSetNowButton?: boolean;
  setNowLabel?: string;
  placeholder?: string;
  icon?: FC<LucideProps> | LucideIcon;
  options?: Pick<DatePickerOptions, 'minimumDate' | 'maximumDate' | 'display'>;
  recyclingKey?: string;
};

export type DatePickerProps = DatePickerInputProps & {
  value?: string | null;
  onChange?: (val: string) => void;
  onBlur?: () => void;
  isDisabled?: boolean;
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function localDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localTimeValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function inputValue(value: string | null | undefined, mode: DatePickerProps['mode']) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  if (mode === 'time' || mode === 'countdown') return localTimeValue(date);
  if (mode === 'datetime') return `${localDateValue(date)}T${localTimeValue(date)}`;
  return localDateValue(date);
}

function mergeValue(raw: string, current: string | null | undefined, mode: DatePickerProps['mode']) {
  const base = current && !Number.isNaN(new Date(current).getTime()) ? new Date(current) : new Date();

  if (mode === 'time' || mode === 'countdown') {
    const [hours, minutes] = raw.split(':').map(Number);
    base.setHours(hours || 0, minutes || 0, 0, 0);
    return base.toISOString();
  }

  if (mode === 'datetime') return new Date(raw).toISOString();

  const [year = base.getFullYear(), month = 1, day = 1] = raw.split('-').map(Number);
  base.setFullYear(year, month - 1, day);
  base.setHours(12, 0, 0, 0);
  return base.toISOString();
}

export function DatePicker({
  value,
  onBlur,
  onChange,
  isDisabled,
  className,
  mode = 'date',
  icon,
  showSetNowButton = false,
  setNowLabel = 'Set Now',
  variant = 'outline',
  size = 'md',
  options,
  ...inputProps
}: DatePickerProps) {
  const { themeColors } = useTheme();
  const htmlType = mode === 'datetime' ? 'datetime-local' : mode === 'time' || mode === 'countdown' ? 'time' : 'date';
  const min = options?.minimumDate ? inputValue(options.minimumDate.toISOString(), mode) : undefined;
  const max = options?.maximumDate ? inputValue(options.maximumDate.toISOString(), mode) : undefined;

  return (
    <Input
      {...inputProps}
      size={size}
      variant={variant}
      isDisabled={isDisabled}
      className={inputStyle({ className })}
    >
      {icon && <Icon size={size} as={icon} className="ml-3" />}
      <input
        type={htmlType}
        value={inputValue(value, mode)}
        min={min}
        max={max}
        disabled={isDisabled}
        onBlur={onBlur}
        onChange={(event) => {
          if (event.currentTarget.value) onChange?.(mergeValue(event.currentTarget.value, value, mode));
        }}
        style={{
          flex: 1,
          minWidth: 0,
          border: 0,
          outline: 'none',
          background: 'transparent',
          color: themeColors.typography[900],
          font: 'inherit',
          padding: '0 12px',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
      />
      {showSetNowButton && (
        <Button
          action="default"
          variant="ghost"
          size="sm"
          className="h-auto w-fit rounded-none pr-3"
          isDisabled={isDisabled}
          onPress={() => onChange?.(new Date().toISOString())}
        >
          <ButtonText>{setNowLabel}</ButtonText>
        </Button>
      )}
    </Input>
  );
}
