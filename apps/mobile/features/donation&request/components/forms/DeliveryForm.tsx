import { DateInputField } from '@/components/form-fields/DateInputField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { getMeUser } from '@/lib/stores/meUserStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryCreateSchema, DeliverySchema, deliverySchema } from '@lactalink/form-schemas';
import { DeliveryPreference, Donation, Request } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import isEqual from 'lodash/isEqual';
import { CalendarDaysIcon, ClockIcon } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import SelectAddressField from './fields/SelectAddressField';
import SelectDeliveryPreferenceField from './fields/SelectDeliveryPreferenceField';

export interface DeliveryFormProps extends VStackProps {
  values?: DeliverySchema;
  onChange?: (data: DeliveryCreateSchema) => void | Promise<void>;
  deliveryPreferences?: DeliveryPreference[] | null;
  matchedListing?: Donation | Request;
  isLoading?: boolean;
  isDisabled?: boolean;
  isSubmitting?: boolean;
}

export default function DeliveryForm({
  onChange,
  values,
  isLoading,
  isDisabled,
  isSubmitting,
  deliveryPreferences: prefs,
  matchedListing,
  ...props
}: DeliveryFormProps) {
  const { control, reset, getValues, handleSubmit, setValue } = useForm({
    resolver: zodResolver(deliverySchema),
    defaultValues: values || { note: '', deliveryPreference: null },
  });

  const selectedDP = useWatch({ control, name: 'deliveryPreference' });
  const deliveryModes = selectedDP?.preferredMode.map((mode) => DELIVERY_OPTIONS[mode]);

  const deliveryPrefs = useMemo(() => {
    const meUser = getMeUser();
    const userDPs = extractCollection(meUser?.deliveryPreferences?.docs) || [];
    const allDPs = new Map<string, DeliveryPreference>();
    [...(prefs ?? []), ...userDPs].forEach((dp) => allDPs.set(dp.id, dp));
    return Array.from(allDPs.values()).sort((a, b) =>
      new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1
    );
  }, [prefs]);

  async function onSubmit(data: DeliverySchema) {
    const deliveryPreference = data.deliveryPreference;

    if (!deliveryPreference) {
      await onChange?.({ ...data, type: 'PROPOSED' });
      return;
    }

    const matchedListingDP = matchedListing?.deliveryPreferences;
    const existingDP = matchedListingDP?.find((dp) => extractID(dp) === deliveryPreference.id);

    if (existingDP) {
      await onChange?.({ ...data, type: 'CONFIRMED' });
    }
    await onChange?.({ ...data, type: 'PROPOSED' });
  }

  // Sync form values with external values when they change,
  // but only if they are different to avoid resetting form state unnecessarily
  useEffect(() => {
    const currentValues = getValues();
    if (!isEqual(currentValues, values)) reset(values);
  }, [getValues, reset, values]);

  useEffect(() => {
    if (selectedDP) {
      setValue('address', selectedDP.address, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      if (selectedDP.preferredMode.length === 1) {
        setValue('mode', selectedDP.preferredMode[0]!, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
      return;
    }
    // Clear address and mode if no delivery preference is selected
    const currentValues = getValues();
    if (currentValues.address) {
      setValue('address', null as never, { shouldDirty: true, shouldTouch: true });
    }
    if (currentValues.mode) {
      setValue('mode', null as never, { shouldDirty: true, shouldTouch: true });
    }
  }, [getValues, setValue, selectedDP]);

  return (
    <VStack {...props} space="lg">
      <SelectDeliveryPreferenceField
        control={control}
        name="deliveryPreference"
        selections={deliveryPrefs}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
      />

      <Divider />

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
        isRequired
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
        isRequired
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
        isRequired
      />

      {!selectedDP && (
        <SelectAddressField
          control={control}
          name="address"
          isDisabled={isDisabled || isSubmitting}
          isLoading={isLoading}
          isRequired
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
        }}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
      />

      <Button
        className="mt-2"
        onPress={handleSubmit(onSubmit)}
        isDisabled={isDisabled || isSubmitting}
      >
        <ButtonText>Confirm</ButtonText>
      </Button>
    </VStack>
  );
}
