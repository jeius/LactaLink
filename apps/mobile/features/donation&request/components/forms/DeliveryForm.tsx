import { DateInputField } from '@/components/form-fields/DateInputField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { Button, ButtonText } from '@/components/ui/button';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { zodResolver } from '@hookform/resolvers/zod';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryCreateSchema, DeliverySchema, deliverySchema } from '@lactalink/form-schemas';
import { DeliveryPreference } from '@lactalink/types/payload-generated-types';
import isEqual from 'lodash/isEqual';
import { CalendarDaysIcon, ClockIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import SelectAddressField from './SelectAddressField';
import SelectDeliveryPreferenceField from './SelectDeliveryPreferenceField';

export interface DeliveryFormProps extends VStackProps {
  values?: DeliverySchema;
  onChange?: (data: DeliveryCreateSchema) => void | Promise<void>;
  deliveryPreferences?: DeliveryPreference[] | null;
  isLoading?: boolean;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  insideBottomSheet?: boolean;
}

export default function DeliveryForm({
  onChange,
  values,
  isLoading,
  isDisabled,
  isSubmitting,
  deliveryPreferences,
  insideBottomSheet = false,
  ...props
}: DeliveryFormProps) {
  const { control, reset, getValues, handleSubmit } = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: { note: '', deliveryPreference: null },
    values: values,
  });

  const selectedDP = useWatch({ control, name: 'deliveryPreference' });
  const deliveryModes = selectedDP?.preferredMode.map((mode) => DELIVERY_OPTIONS[mode]);

  useEffect(() => {
    if (selectedDP) {
      const currentValues = getValues();
      const newValues = { ...currentValues, address: selectedDP.address };

      if (selectedDP.preferredMode.length === 1) {
        newValues.mode = selectedDP.preferredMode[0]!;
      }

      // Only reset if the values have actually changed
      const hasChanged = !isEqual(currentValues, newValues);

      if (hasChanged) {
        reset(newValues);
      }
    } else {
      if (values) {
        reset(values);
        return;
      }

      const currentValues = getValues();
      const hasAddressOrMode = currentValues.address || currentValues.mode;

      if (hasAddressOrMode) {
        reset({ ...currentValues, address: undefined, mode: undefined });
      }
    }
  }, [getValues, reset, selectedDP, values]);

  async function onSubmit(data: DeliverySchema) {
    if (data.deliveryPreference) {
      await onChange?.({ ...data, type: 'PROPOSED' });
    } else {
      await onChange?.({ ...data, type: 'CONFIRMED' });
    }
  }

  return (
    <VStack {...props} space="lg">
      <SelectDeliveryPreferenceField
        control={control}
        name="deliveryPreference"
        selections={deliveryPreferences ?? undefined}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
      />

      <SelectInputField
        control={control}
        name="mode"
        label="Method"
        helperText="Method of transaction (e.g. Delivery, Meet-up)"
        items={deliveryModes || Object.values(DELIVERY_OPTIONS)}
        transformItem={(item) => item}
        triggerInputProps={{ placeholder: 'Select a method...' }}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
      />

      <DateInputField
        control={control}
        name="date"
        label="Preferred Date"
        helperText="Select your preferred date"
        datePickerProps={{
          mode: 'date',
          options: { display: 'calendar', minimumDate: new Date() },
          icon: CalendarDaysIcon,
          placeholder: 'Select a date...',
        }}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
      />

      <DateInputField
        control={control}
        name="time"
        label="Preferred Time"
        helperText="Select your preferred time"
        datePickerProps={{
          mode: 'time',
          options: { display: 'spinner' },
          icon: ClockIcon,
          placeholder: 'Select time...',
        }}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
      />

      {!selectedDP && (
        <SelectAddressField
          control={control}
          name="address"
          isDisabled={isDisabled || isSubmitting}
          isLoading={isLoading}
        />
      )}

      <TextAreaField
        control={control}
        name="note"
        label="Instructions"
        helperText="Additional delivery instructions (optional)"
        textareaProps={{
          keyboardType: 'default',
          placeholder: 'Enter any additional instructions here',
          useBottomSheetInput: insideBottomSheet,
        }}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
      />

      <Button className="mt-2" onPress={handleSubmit(onSubmit)}>
        <ButtonText>Confirm</ButtonText>
      </Button>
    </VStack>
  );
}
