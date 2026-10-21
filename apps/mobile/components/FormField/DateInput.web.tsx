import { DatePicker } from '@/components/DatePicker';
import { CalendarRangeIcon, LucideIcon, LucideProps } from 'lucide-react-native';
import { ComponentPropsWithoutRef, FC } from 'react';
import { Noop } from 'react-hook-form';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';

type TInput = Pick<ComponentPropsWithoutRef<typeof Input>, 'variant' | 'className' | 'style'>;

export type DateInputType = TInput & {
  hideIcon?: boolean;
  mode?: 'date' | 'datetime' | 'time' | 'countdown';
  showSetNowButton?: boolean;
  setNowLabel?: string;
  placeholder?: string;
  datePickerOptions?: ComponentPropsWithoutRef<typeof DatePicker>['options'];
  isLoading?: boolean;
};

export type DateInputProps<T extends string = string> = DateInputType & {
  value?: T;
  onChange?: (val: T) => void;
  onBlur?: Noop;
  isDisabled?: boolean;
  icon?: FC<LucideProps> | LucideIcon;
};

export function DateInput<T extends string = string>({
  value,
  onBlur,
  onChange,
  hideIcon = false,
  isDisabled,
  className,
  style,
  placeholder = 'Select date...',
  mode = 'date',
  icon = CalendarRangeIcon,
  showSetNowButton = false,
  setNowLabel = 'Set Now',
  variant = 'outline',
  datePickerOptions,
  isLoading,
}: DateInputProps) {
  if (isLoading) return <Skeleton className="h-9" />;

  return (
    <DatePicker
      value={value}
      onBlur={onBlur}
      onChange={(next) => onChange?.(next as T)}
      isDisabled={isDisabled}
      className={className}
      style={style}
      placeholder={placeholder}
      mode={mode}
      icon={hideIcon ? undefined : icon}
      showSetNowButton={showSetNowButton}
      setNowLabel={setNowLabel}
      variant={variant}
      options={datePickerOptions}
    />
  );
}
