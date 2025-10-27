import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryMode } from '@lactalink/types';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { AlertCircleIcon, ChevronDownIcon } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../animated/pressable';
import { DeliveryPreferenceCard } from '../cards';
import { FieldWrapper } from '../form-fields/FieldWrapper';
import { Box } from '../ui/box';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from '../ui/form-control';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '../ui/select';

type BaseFieldProps<T> = {
  value: T;
  onChange: (value: T) => void;
  error?: { message: string } | null;
  isDisabled?: boolean;
};

interface DeliveryPreferenceSelectProps extends BaseFieldProps<DeliveryPreference | null> {
  deliveryPreferences: DeliveryPreference[];
}

interface DeliveryModeFieldProps extends BaseFieldProps<DeliveryMode> {
  modes: DeliveryMode[];
}

export function DeliveryPreferenceSelectField({
  value,
  onChange,
  deliveryPreferences,
  error,
}: DeliveryPreferenceSelectProps) {
  const cardStyle = useMemo(
    () =>
      tva({
        base: 'w-52 flex-1 p-4',
        variants: { isSelected: { true: 'border-primary-500 border-2' } },
      }),
    []
  );

  return (
    <FieldWrapper
      label="Delivery Preferences"
      error={error}
      contentPosition="last"
      helperText="You may choose one from the delivery preferences"
    >
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-1 mt-2"
        contentContainerClassName="px-5"
        ItemSeparatorComponent={() => <Box className="w-3" />}
        keyExtractor={(item) => item.id}
        data={deliveryPreferences}
        renderItem={({ item }) => {
          const isSelected = extractID(value) === item.id;
          return (
            <AnimatedPressable
              onPress={() => onChange(isSelected ? null : item)}
              className="overflow-hidden rounded-2xl"
            >
              <DeliveryPreferenceCard
                preference={item}
                size="sm"
                appearance="list-item"
                hideIconLabels
                className={cardStyle({ isSelected })}
                variant="filled"
              />
            </AnimatedPressable>
          );
        }}
      />
    </FieldWrapper>
  );
}

export function DeliveryModeField({
  value,
  onChange,
  modes,
  error,
  isDisabled: disabled,
}: DeliveryModeFieldProps) {
  const insets = useSafeAreaInsets();

  function handleChange(val: string) {
    onChange(val as DeliveryMode);
  }

  return (
    <FormControl isInvalid={!!error} isDisabled={disabled}>
      <FormControlLabel>
        <FormControlLabelText>Delivery Mode</FormControlLabelText>
      </FormControlLabel>

      <Select selectedValue={value} onValueChange={handleChange}>
        <SelectTrigger disabled={disabled} size="md">
          <SelectInput
            className="flex-1"
            placeholder="Select delivery mode"
            value={DELIVERY_OPTIONS[value].label}
          />
          <SelectIcon className="mr-3" as={ChevronDownIcon} />
        </SelectTrigger>

        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className="px-4" style={{ paddingBottom: insets.bottom }}>
            <SelectDragIndicatorWrapper className="pb-4">
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {modes.map((mode, idx) => (
              <SelectItem
                key={`${mode}-${idx}`}
                value={mode}
                label={DELIVERY_OPTIONS[mode].label}
              />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>

      <FormControlHelper>
        <FormControlHelperText>Select a delivery mode/method</FormControlHelperText>
      </FormControlHelper>

      {error && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{error.message}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
}
