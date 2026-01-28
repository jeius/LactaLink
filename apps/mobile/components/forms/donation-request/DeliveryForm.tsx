import { AnimatedPressable } from '@/components/animated/pressable';
import { AddressCard } from '@/components/cards';
import { DeliveryPreferenceCard } from '@/components/cards/DeliveryPreferenceCard';
import { DateInputField } from '@/components/form-fields/DateInputField';
import { SelectInputField } from '@/components/form-fields/SelectInputField';
import { SelectListField } from '@/components/form-fields/SelectListField';
import { TextAreaField } from '@/components/form-fields/TextAreaField';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
  FormControlProps,
} from '@/components/ui/form-control';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack, VStackProps } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import {
  transformToAddressSchema,
  transformToDeliveryPreferenceSchema,
} from '@/lib/utils/transformData';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { zodResolver } from '@hookform/resolvers/zod';
import { DELIVERY_OPTIONS } from '@lactalink/enums';
import { DeliveryCreateSchema, DeliverySchema, deliverySchema } from '@lactalink/form-schemas';
import { Address, DeliveryPreference } from '@lactalink/types/payload-generated-types';
import { extractCollection, listKeyExtractor } from '@lactalink/utilities/extractors';
import { Link } from 'expo-router';
import isEqual from 'lodash/isEqual';
import { AlertCircleIcon, CalendarDaysIcon, ClockIcon, PlusCircleIcon } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { Control, useController, useForm, useWatch } from 'react-hook-form';
import { FlatList } from 'react-native-gesture-handler';

const dpCardStyle = tva({
  base: 'w-52 flex-1 p-4',
  variants: { isSelected: { true: 'border-2 border-primary-500' } },
});

export interface DeliveryFormProps extends VStackProps {
  values?: DeliverySchema;
  onChange?: (data: DeliveryCreateSchema) => void | Promise<void>;
  deliveryPreferences?: DeliveryPreference[] | null;
  isLoading?: boolean;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  insideBottomSheet?: boolean;
}

export function DeliveryForm({
  onChange,
  values,
  isLoading,
  isDisabled,
  isSubmitting,
  deliveryPreferences,
  insideBottomSheet = false,
  ...props
}: DeliveryFormProps) {
  const { control, reset, getValues, handleSubmit } = useForm<DeliverySchema>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { note: '', deliveryPreference: null },
    values: values,
  });

  const dpMap = useMemo(
    () => new Map(deliveryPreferences?.map((dp) => [dp.id, dp]) || []),
    [deliveryPreferences]
  );

  const selectedDP = useWatch({ control, name: 'deliveryPreference' });
  const dpSelectItems = useMemo(
    () => deliveryPreferences?.map((dp) => transformToDeliveryPreferenceSchema(dp)),
    [deliveryPreferences]
  );
  const address = selectedDP && extractCollection(dpMap.get(selectedDP.id)?.address);
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
      <SelectListField
        control={control}
        name="deliveryPreference"
        label="Delivery Preference (Optional)"
        helperText="You can choose from the delivery preferences when setting up the delivery details."
        listProps={{ horizontal: true, className: '-mx-5' }}
        items={dpSelectItems ?? []}
        renderItem={(item, _, { isSelected, isLoading }) => (
          <DeliveryPreferenceCard
            preference={item}
            size="sm"
            appearance="list-item"
            hideIconLabels
            className={dpCardStyle({ isSelected })}
            variant="filled"
            isLoading={isLoading}
          />
        )}
      />

      <SelectInputField
        control={control}
        name="mode"
        label="Method"
        helperText="Method of transaction (e.g. Delivery, Meet-up)"
        items={deliveryModes || Object.values(DELIVERY_OPTIONS)}
        selectInputProps={{ placeholder: 'Select a method...' }}
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

      <AddressesField
        control={control}
        isDisabled={isDisabled || isSubmitting}
        isLoading={isLoading}
        addresses={address ? [address] : undefined}
      />

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

interface AddressesFieldProps extends FormControlProps {
  control: Control<DeliverySchema>;
  isLoading?: boolean;
  addresses?: Address[];
}

function AddressesField({
  control,
  addresses,
  isDisabled,
  isLoading,
  ...props
}: AddressesFieldProps) {
  const { data: meUser } = useMeUser();

  const deliveryPreference = useWatch({ control, name: 'deliveryPreference' });

  const selections = useMemo(() => {
    const userAddresses = addresses || extractCollection(meUser?.addresses?.docs) || [];
    return userAddresses.sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1));
  }, [addresses, meUser?.addresses?.docs]);

  const cardStyle = tva({
    base: 'w-64 flex-1',
    variants: { isSelected: { true: 'border-2 border-primary-500' } },
  });

  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name: 'address' });

  return (
    <FormControl {...props} isInvalid={!!error} isDisabled={isDisabled}>
      <FormControlLabel className="gap-2">
        <FormControlLabelText>Address</FormControlLabelText>
      </FormControlLabel>

      <FormControlHelper>
        <FormControlHelperText>Select the address of transaction</FormControlHelperText>
      </FormControlHelper>

      {error && (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} />
          <FormControlErrorText>{error.message}</FormControlErrorText>
        </FormControlError>
      )}

      <FlatList
        horizontal
        data={selections}
        keyExtractor={listKeyExtractor}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <Box className="w-3" />}
        contentContainerClassName="px-5"
        className="-mx-5 mt-2"
        renderItem={({ item }) => {
          const isSelected = value?.id === item.id;

          function handleSelect() {
            onChange(isSelected ? null : transformToAddressSchema(item));
            onBlur();
          }

          return (
            <AnimatedPressable
              onPress={handleSelect}
              disabled={isDisabled}
              className="overflow-hidden rounded-2xl"
              disableRipple
            >
              <AddressCard
                data={item}
                showMap
                disableTapOnMap
                isLoading={isLoading}
                isDisabled={isDisabled}
                className={cardStyle({ isSelected })}
                variant="filled"
              />
            </AnimatedPressable>
          );
        }}
        ListFooterComponentClassName="px-2 items-stretch"
        ListFooterComponent={() => {
          if (deliveryPreference) return null;
          return (
            <Link href={'/addresses/create'} asChild push>
              <AnimatedPressable
                className="flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl"
                style={{ width: 200 }}
              >
                <Icon as={PlusCircleIcon} size="2xl" />
                <Text className="font-JakartaSemiBold">New Address</Text>
              </AnimatedPressable>
            </Link>
          );
        }}
      />
    </FormControl>
  );
}
